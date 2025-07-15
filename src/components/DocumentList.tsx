
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Document } from '@/pages/Index';

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (id: string) => void;
}

export const DocumentList = ({ documents, onDeleteDocument }: DocumentListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      uploading: 'default',
      processing: 'secondary',
      ready: 'default',
      error: 'destructive'
    } as const;

    const labels = {
      uploading: 'Uploading',
      processing: 'Processing',
      ready: 'Ready',
      error: 'Error'
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
        <p className="text-muted-foreground">Go to the Upload tab to add your first PDF document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{document.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(document.size)}</span>
                    <span>{formatDate(document.uploadDate)}</span>
                  </div>
                  {document.status === 'uploading' && document.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={document.progress} className="h-2" />
                    </div>
                  )}
                  {document.status === 'error' && document.errorMessage && (
                    <p className="text-sm text-red-500 mt-1">{document.errorMessage}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(document.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteDocument(document.id)}
                  disabled={document.status === 'uploading'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
