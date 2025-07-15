
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DocumentList } from '@/components/DocumentList';
import { ChatInterface } from '@/components/ChatInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Upload } from 'lucide-react';

export interface Document {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    const newDocuments: Document[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
      status: 'uploading',
      progress: 0
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Simulate upload process
    for (const doc of newDocuments) {
      try {
        // Update progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setDocuments(prev => prev.map(d => 
            d.id === doc.id ? { ...d, progress } : d
          ));
        }

        // Mark as processing
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'processing', progress: 100 } : d
        ));

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark as ready
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'ready' } : d
        ));
      } catch (error) {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { 
            ...d, 
            status: 'error', 
            errorMessage: 'Failed to process document' 
          } : d
        ));
      }
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: "I'm a demo response. Connect this to your backend API to get real answers based on your uploaded documents.",
        timestamp: new Date(),
        sources: documents.filter(d => d.status === 'ready').slice(0, 2).map(d => d.name)
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: "Sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const readyDocuments = documents.filter(doc => doc.status === 'ready');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">PDF Knowledge Quest</h1>
          <p className="text-muted-foreground text-lg">
            Upload PDFs and ask questions to get answers based on your documents
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload PDF Documents</CardTitle>
                <CardDescription>
                  Upload one or more PDF files to create your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Manage your uploaded PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentList 
                  documents={documents} 
                  onDeleteDocument={handleDeleteDocument}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Ask Questions</CardTitle>
                <CardDescription>
                  {readyDocuments.length > 0 
                    ? `Ask questions about your ${readyDocuments.length} uploaded document${readyDocuments.length > 1 ? 's' : ''}`
                    : "Upload documents first to start asking questions"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ChatInterface
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isProcessing={isProcessing}
                  disabled={readyDocuments.length === 0}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
