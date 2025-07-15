import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  /** Receives the documents array returned by backend */
  onFileUpload: (documents: any[]) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    setSelectedFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (idx: number) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    const form = new FormData();
    selectedFiles.forEach((file) => {
      form.append("files", file); // 👈 use files[] for compatibility
    });

    console.log("Uploading:", form.getAll("files[]")); // Debug log

    try {
      const res = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      onFileUpload(data.documents); // pass docs to parent
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the PDF files here…</p>
            ) : (
              <>
                <p className="text-lg mb-2">
                  Drag & drop PDF files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Support for multiple PDF files
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Selected Files ({selectedFiles.length})
            </h3>

            <div className="space-y-2 mb-4">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={handleUpload}
              className="w-full"
              disabled={uploading}
            >
              {uploading
                ? "Uploading…"
                : `Upload ${selectedFiles.length} File${
                    selectedFiles.length > 1 ? "s" : ""
                  }`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
