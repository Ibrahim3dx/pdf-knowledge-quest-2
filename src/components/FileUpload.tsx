import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (documents: any[]) => void;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    console.log("Files dropped:", accepted);
    setSelectedFiles(accepted); // replace list instead of merging duplicates
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
    if (uploading || selectedFiles.length === 0) return;

    const form = new FormData();
    selectedFiles.forEach((file) => form.append("files", file)); // key is "files"

    console.log("Uploading:", form.getAll("files"));
    setUploading(true);

    try {
      const res = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) throw data;
      onFileUpload(data.documents);
      setSelectedFiles([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed – see console for details.");
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
            <p className="text-lg mb-2">
              Drag & drop PDF files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Only PDF files are supported
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Selected Files ({selectedFiles.length})
            </h3>

            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-muted rounded p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-red-500 w-5 h-5" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(i)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
