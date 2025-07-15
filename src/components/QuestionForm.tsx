import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

interface AskQuestionProps {
  documentIds: string[];
}

export const AskQuestion = ({ documentIds }: AskQuestionProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim() || documentIds.length === 0) return;

    setLoading(true);
    setAnswer(null);
    setSources([]);

    try {
      const res = await fetch(`${API_BASE}/ask/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, document_ids: documentIds }),
      });

      if (!res.ok) throw new Error("Failed to get answer");

      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      console.error(err);
      setAnswer("Failed to get an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">Ask a Question</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1"
        />
        <Button onClick={ask} disabled={loading || !question}>
          {loading ? "Asking…" : "Ask"}
        </Button>
      </div>

      {answer && (
        <div className="mt-4">
          <p className="text-muted-foreground mb-1 text-sm">Answer:</p>
          <Textarea value={answer} readOnly rows={5} />

          {sources.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Sources: {sources.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
