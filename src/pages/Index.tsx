import { useState } from "react";
import { FileUpload } from "@/components/FileUpload"; // adjust path if needed
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [documents, setDocuments] = useState<any[]>([]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">PDF Knowledge Uploader</h1>

      <FileUpload onFileUpload={setDocuments} />

      {documents.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Uploaded Documents</h2>
            <ul className="list-disc pl-6">
              {documents.map((doc) => (
                <li key={doc.id}>
                  {doc.name} — <span className="text-muted-foreground">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
