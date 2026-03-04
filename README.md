# RAG Chat App

A production-quality RAG (Retrieval-Augmented Generation) chat application built with Next.js, pgvector, and a Python embedding microservice.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Next.js    │────▶│  PostgreSQL  │     │   Python      │
│   Frontend   │     │  + pgvector  │     │  Embed API    │
│   + API      │────▶│             │     │  (FastAPI)    │
└─────────────┘     └─────────────┘     └──────────────┘
       │                                        ▲
       │            ┌─────────────┐             │
       └───────────▶│  Gemini AI  │             │
                    │  (via SDK)  │             │
                    └─────────────┘             │
       └────────────────────────────────────────┘
         Embeddings for RAG retrieval
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Shadcn UI
- **Auth**: Auth.js v5 (credentials + Google + GitHub OAuth)
- **Database**: PostgreSQL with pgvector extension (Drizzle ORM)
- **AI**: Vercel AI SDK with Google Gemini
- **Embeddings**: Python FastAPI + sentence-transformers (all-MiniLM-L6-v2)
- **Containerization**: Docker Compose

## Features

- Document upload (text + PDF) with automatic chunking and embedding
- RAG-powered chat with citations
- Streaming AI responses
- Tree-structured chat history with branching (edit/regenerate)
- Markdown rendering with syntax highlighting
- Admin dashboard with user management
- Dark/light mode

## Quick Start

### 1. Clone & configure

```bash
git clone <repo-url>
cd <repo-name>
cp .env.example .env
```

Edit `.env` and set your secrets:
- `GEMINI_API_KEY` — Google AI API key
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- OAuth credentials (optional): `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, etc.

### 2. Start Docker services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL with pgvector on port 5432
- Python embedding API on port 8000

### 3. Install & migrate

```bash
pnpm install
pnpm db:push
pnpm db:seed    # optional: creates test users
```

### 4. Run

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Verification endpoints

- `/healthz` — health check
- `/version` — app version

## Test Credentials (after seeding)

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@example.com  | Admin123 |
| User  | user@example.com   | User1234 |

## Environment Variables

See `.env.example` for all required variables.

| Variable           | Required | Description                    |
|--------------------|----------|--------------------------------|
| DATABASE_URL       | Yes      | PostgreSQL connection string   |
| NEXTAUTH_URL       | Yes      | App URL (http://localhost:3000)|
| NEXTAUTH_SECRET    | Yes      | Auth.js secret key             |
| GEMINI_API_KEY     | Yes      | Google Gemini API key          |
| EMBEDDING_API_URL  | Yes      | Python embed service URL       |
| GOOGLE_CLIENT_ID   | No       | Google OAuth client ID         |
| GITHUB_CLIENT_ID   | No       | GitHub OAuth client ID         |
| RESEND_API_KEY     | No       | Email service API key          |
