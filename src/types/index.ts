export type UserRole = "user" | "admin";

export type DocumentStatus = "pending" | "processing" | "ready" | "error";

export type MessageRole = "user" | "assistant" | "system";

export interface Citation {
  documentId: string;
  chunkId: string;
  content: string;
  filename: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  parentId: string | null;
  role: MessageRole;
  content: string;
  citations: Citation[] | null;
  siblingIndex: number;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentMeta {
  id: string;
  userId: string;
  title: string;
  filename: string;
  fileType: string;
  status: DocumentStatus;
  chunkCount?: number;
  createdAt: Date;
}
