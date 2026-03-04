import { db } from "../src/lib/db";
import { users, documents, conversations, messages } from "../src/lib/db/schema";
import { hashSync } from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin User",
      email: "admin@example.com",
      hashedPassword: hashSync("Admin123", 10),
      role: "admin",
      emailVerified: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  // Create regular user
  const [regular] = await db
    .insert(users)
    .values({
      name: "Test User",
      email: "user@example.com",
      hashedPassword: hashSync("User1234", 10),
      role: "user",
      emailVerified: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  const userId = regular?.id || admin?.id;
  if (!userId) {
    console.log("Users already exist, skipping seed.");
    process.exit(0);
  }

  // Create a sample document
  const [doc] = await db
    .insert(documents)
    .values({
      userId,
      title: "Sample Document",
      filename: "sample.txt",
      fileType: "text",
      content:
        "This is a sample document for testing the RAG system. It contains information about the project architecture. The application uses Next.js with pgvector for vector similarity search. Documents are chunked and embedded using a Python microservice running sentence-transformers.",
      status: "pending",
    })
    .returning();

  // Create a sample conversation
  const [conv] = await db
    .insert(conversations)
    .values({
      userId,
      title: "Welcome Chat",
    })
    .returning();

  // Create sample messages
  const [userMsg] = await db
    .insert(messages)
    .values({
      conversationId: conv.id,
      parentId: null,
      role: "user",
      content: "Hello! What can you help me with?",
      siblingIndex: 0,
    })
    .returning();

  await db.insert(messages).values({
    conversationId: conv.id,
    parentId: userMsg.id,
    role: "assistant",
    content:
      "Hello! I can help you with questions about your uploaded documents. Upload text or PDF files, and I'll use them to provide context-aware answers with citations. How can I assist you today?",
    siblingIndex: 0,
  });

  console.log("Database seeded successfully!");
  console.log("  Admin: admin@example.com / Admin123");
  console.log("  User:  user@example.com / User1234");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
