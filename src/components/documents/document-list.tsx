"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileText, File, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  filename: string;
  fileType: string;
  status: string;
  chunkCount: number;
  createdAt: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  ready: "bg-green-500/10 text-green-600",
  error: "bg-red-500/10 text-red-600",
};

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`"${filename}" deleted`);
      onDelete();
    } catch {
      toast.error("Failed to delete document");
    }
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No documents uploaded yet. Upload a file to get started.
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            {doc.fileType === "pdf" ? (
              <File className="h-5 w-5 shrink-0 text-red-500" />
            ) : (
              <FileText className="h-5 w-5 shrink-0 text-blue-500" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{doc.filename}</p>
              <p className="text-xs text-muted-foreground">
                {doc.chunkCount} chunks &middot;{" "}
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={statusColors[doc.status]}>
              {doc.status === "processing" && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              {doc.status}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id, doc.filename)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
