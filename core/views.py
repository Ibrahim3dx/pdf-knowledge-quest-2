import os
import json
import faiss
import numpy as np

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Document
from .serializers import DocumentSerializer
from .pdf_processor import extract_text_from_pdf, chunk_text, generate_faiss_index
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from openai import OpenAI

client = OpenAI()  # Uses OPENAI_API_KEY from env

class DocumentUploadView(APIView):
    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist('files')

        if not files:
            return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)

        documents = []

        for f in files:
            doc = Document.objects.create(
                file=f,
                name=f.name,
                size=f.size,
                status='processing'
            )

            try:
                # Step 1: Extract text from PDF
                pdf_path = doc.file.path
                text = extract_text_from_pdf(pdf_path)

                # Step 2: Chunk the text
                chunks = chunk_text(text)

                # Step 3: Generate FAISS vector index
                faiss_index, _ = generate_faiss_index(chunks)

                # Step 4: Save FAISS index & chunks
                vector_dir = os.path.join(settings.MEDIA_ROOT, "vectors")
                os.makedirs(vector_dir, exist_ok=True)

                index_path = os.path.join(vector_dir, f"{doc.id}.index")
                faiss.write_index(faiss_index, index_path)

                chunks_path = os.path.join(vector_dir, f"{doc.id}.chunks")
                with open(chunks_path, "w", encoding="utf-8") as f:
                    json.dump(chunks, f, ensure_ascii=False)

                doc.status = 'ready'
                doc.save()

            except Exception as e:
                print(f"[ERROR] Processing '{doc.name}': {e}")
                doc.status = 'error'
                doc.save()

            documents.append(doc)

        serializer = DocumentSerializer(documents, many=True)
        return Response({'success': True, 'documents': serializer.data}, status=status.HTTP_201_CREATED)


class AskQuestionView(APIView):
    def post(self, request, *args, **kwargs):
        question = request.data.get("question")
        document_ids = request.data.get("document_ids", [])

        if not question:
            return Response({"error": "No question provided."}, status=status.HTTP_400_BAD_REQUEST)

        model = SentenceTransformer('all-MiniLM-L6-v2')
        question_embedding = model.encode([question])[0].astype("float32")

        top_results = []

        for doc_id in document_ids:
            try:
                vector_dir = os.path.join(settings.MEDIA_ROOT, "vectors")
                index_path = os.path.join(vector_dir, f"{doc_id}.index")
                chunks_path = os.path.join(vector_dir, f"{doc_id}.chunks")

                if not os.path.exists(index_path) or not os.path.exists(chunks_path):
                    continue

                index = faiss.read_index(index_path)

                with open(chunks_path, "r", encoding="utf-8") as f:
                    chunks = json.load(f)

                D, I = index.search(np.array([question_embedding]), k=10)

                for idx in I[0]:
                    if 0 <= idx < len(chunks):
                        chunk = chunks[idx]
                        chunk_embedding = model.encode([chunk])[0]
                        score = cosine_similarity([question_embedding], [chunk_embedding])[0][0]
                        top_results.append((score, chunk, doc_id))

            except Exception as e:
                print(f"[ERROR] Searching '{doc_id}': {e}")

        if not top_results:
            return Response({"answer": "No relevant data found.", "sources": []})

        # Sort and extract top 3
        top_results.sort(reverse=True, key=lambda x: x[0])
        top_chunks = [chunk for _, chunk, _ in top_results[:3]]
        top_sources = list({doc_id for _, _, doc_id in top_results[:3]})

        context = "\n\n".join(top_chunks)
        prompt = f"""Answer the question based only on the text below. Be concise and accurate.\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"""

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers based only on provided context."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            answer = response.choices[0].message.content.strip()

        except Exception as e:
            print(f"[OpenAI ERROR] {e}")
            return Response({"error": "Failed to generate answer."}, status=500)

        return Response({
            "answer": answer,
            "sources": top_sources,
            "confidence": float(top_results[0][0])
        })
