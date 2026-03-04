"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadFormProps {
  onUploadComplete: () => void;
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["txt", "pdf"].includes(ext)) {
      toast.error("Only .txt and .pdf files are supported");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      toast.success(`"${file.name}" uploaded successfully. Processing...`);
      onUploadComplete();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading ? (
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      ) : (
        <Upload className="h-10 w-10 text-muted-foreground" />
      )}

      <p className="mt-3 text-sm font-medium">
        {uploading ? "Uploading..." : "Drop a file here or click to upload"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Supports .txt and .pdf files
      </p>

      {!uploading && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="mr-2 h-4 w-4" />
          Choose File
        </Button>
      )}
    </div>
  );
}
