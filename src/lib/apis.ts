const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function uploadDocuments(files: File[]) {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const res = await fetch(`${BASE_URL}/upload/`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Failed to upload documents");

  return res.json();
}

export async function askQuestion(question: string, document_ids: string[]) {
  const res = await fetch(`${BASE_URL}/ask/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question, document_ids })
  });

  if (!res.ok) throw new Error("Failed to get an answer");

  return res.json();
}
