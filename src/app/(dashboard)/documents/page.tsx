"use client";

import { useState, useEffect, useCallback } from "react";
import { UploadForm } from "@/components/documents/upload-form";
import { DocumentList } from "@/components/documents/document-list";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="mt-1 text-muted-foreground">
          Upload and manage your documents for RAG retrieval.
        </p>
      </div>

      <div className="mt-6">
        <UploadForm onUploadComplete={fetchDocuments} />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading documents...
          </div>
        ) : (
          <DocumentList documents={documents} onDelete={fetchDocuments} />
        )}
      </div>
    </div>
  );
}
