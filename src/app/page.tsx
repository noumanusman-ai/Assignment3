import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArborVect | Intelligence Rooted in Context",
  description:
    "pgvector-powered RAG backend with Python-driven embeddings. Build production-ready AI applications with full conversational history branching.",
};

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-[#0a0a0a] text-slate-100 selection:bg-[#6467f2]/30">
      {/* Google Fonts & Material Symbols */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .glass-panel {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(12px);
              border: 1px solid #262626;
            }
          `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#6467f2] p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white text-xl">
                account_tree
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              ArborVect
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a className="hover:text-white transition-colors" href="#features">
              Features
            </a>
            <a
              className="hover:text-white transition-colors"
              href="#tech-stack"
            >
              Tech Stack
            </a>
            <a className="hover:text-white transition-colors" href="#preview">
              Docs
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#6467f2] hover:bg-[#6467f2]/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-lg shadow-[#6467f2]/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 px-6">
          <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(100,103,242,0.15)_0%,rgba(100,103,242,0.05)_40%,transparent_70%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[1000px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(100,103,242,0.12)_0%,transparent_60%)] opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#0a0a0a_90%)]" />
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#6467f2]/30 bg-[#6467f2]/10 text-[#6467f2] text-xs font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6467f2] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6467f2]" />
              </span>
              v1.2.0 is now live with PDF processing
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              Intelligence Rooted <br className="hidden md:block" /> in Context
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              pgvector-powered RAG backend with Python-driven embeddings. Build
              production-ready AI applications with full conversational history
              branching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-[#6467f2] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(100,103,242,0.4)] transition-all"
              >
                Get Started
              </Link>
              <a
                href="https://github.com/noumanusman-ai/Assignment3"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 border border-[#262626] bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">code</span>
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section
          id="features"
          className="py-24 px-6 border-t border-[#262626] bg-[#0c0c0c]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-8 rounded-xl hover:border-[#6467f2]/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-[#6467f2]/10 flex items-center justify-center mb-6 group-hover:bg-[#6467f2]/20 transition-colors text-[#6467f2]">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  Vector Search
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Powered by pgvector for precise document retrieval and
                  similarity matching.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-xl hover:border-[#6467f2]/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-[#6467f2]/10 flex items-center justify-center mb-6 group-hover:bg-[#6467f2]/20 transition-colors text-[#6467f2]">
                  <span className="material-symbols-outlined">
                    account_tree
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  Tree-Structured History
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Edit and branch conversations without losing context like a
                  git tree. Navigate states seamlessly.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-xl hover:border-[#6467f2]/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-[#6467f2]/10 flex items-center justify-center mb-6 group-hover:bg-[#6467f2]/20 transition-colors text-[#6467f2]">
                  <span className="material-symbols-outlined">
                    description
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  Smart Ingestion
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Seamlessly parse and chunk text and PDF files with automated
                  metadata extraction.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-xl hover:border-[#6467f2]/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-[#6467f2]/10 flex items-center justify-center mb-6 group-hover:bg-[#6467f2]/20 transition-colors text-[#6467f2]">
                  <span className="material-symbols-outlined">
                    verified_user
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  Production Auth
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Secure login via Google, GitHub, and Email/Password out of the
                  box with JWT support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Preview */}
        <section id="preview" className="py-24 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Integrated Intelligence
              </h2>
              <p className="text-slate-400">
                Experience the interface your users will love.
              </p>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#111] shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="h-12 bg-[#1a1a1a] border-b border-[#262626] px-6 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  arborvect-interface-preview
                </div>
                <div className="w-8" />
              </div>

              <div className="p-6 md:p-10 space-y-8">
                {/* User Message */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">
                      person
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-300">
                      Developer
                    </p>
                    <p className="text-slate-300">
                      How do I initialize a new vector collection in ArborVect?
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#6467f2] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm text-white">
                      bolt
                    </span>
                  </div>
                  <div className="flex-grow space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#6467f2]">
                        ArborVect AI
                      </p>
                      <p className="text-slate-300">
                        You can initialize a collection using the Python SDK.
                        Here is a simple snippet:
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm border border-[#262626]">
                      <div className="flex gap-2 mb-2 opacity-50">
                        <span className="text-blue-400">import</span>{" "}
                        arborvect as av
                      </div>
                      <div>
                        client = av.Client(
                        <span className="text-green-400">
                          &quot;http://localhost:8000&quot;
                        </span>
                        )
                      </div>
                      <div className="mt-2 text-slate-500">
                        # Create a tree-structured vector store
                      </div>
                      <div>collection = client.create_collection(</div>
                      <div className="pl-4">
                        name=
                        <span className="text-green-400">
                          &quot;docs_main&quot;
                        </span>
                        ,
                      </div>
                      <div className="pl-4">
                        embedding_model=
                        <span className="text-green-400">
                          &quot;text-embedding-3-small&quot;
                        </span>
                      </div>
                      <div>)</div>
                    </div>
                    <div className="pt-4 border-t border-[#262626]">
                      <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          link
                        </span>{" "}
                        SOURCES
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 border border-[#262626]">
                          API_Reference.pdf · Page 42
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 border border-[#262626]">
                          SDK_Guide.md · Line 120
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="p-6 border-t border-[#262626] bg-[#0c0c0c]">
                <div className="relative">
                  <input
                    className="w-full bg-white/5 border border-[#262626] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6467f2]/50 text-white placeholder:text-slate-600"
                    placeholder="Ask a question about your documents..."
                    type="text"
                    readOnly
                  />
                  <button className="absolute right-2 top-2 h-8 w-8 rounded bg-[#6467f2] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">
                      arrow_upward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section
          id="tech-stack"
          className="py-24 px-6 border-t border-[#262626]"
        >
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-12">
              The Modern Stack
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-all duration-500">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-white">
                  web
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Next.js
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-white">
                  code
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Python
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-white">
                  storage
                </span>
                <span className="text-xs font-mono text-slate-500">
                  PostgreSQL
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-white">
                  database
                </span>
                <span className="text-xs font-mono text-slate-500">
                  pgvector
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-white">
                  palette
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Tailwind CSS
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-[#262626] py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#6467f2] p-1 rounded-lg">
                <span className="material-symbols-outlined text-white text-lg">
                  account_tree
                </span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                ArborVect
              </span>
            </div>
            <p className="text-slate-500 max-w-sm">
              Building the foundation for intelligent, context-aware
              applications. Open source and built for developers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>
                <a
                  className="hover:text-[#6467f2] transition-colors"
                  href="#"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#6467f2] transition-colors"
                  href="#"
                >
                  Public Repo
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#6467f2] transition-colors"
                  href="#"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#6467f2] transition-colors"
                  href="#"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
              Community
            </h4>
            <div className="bg-[#6467f2]/10 border border-[#6467f2]/20 rounded-xl p-6">
              <p className="text-xs font-semibold text-[#6467f2] mb-2">
                JOIN OUR SLACK
              </p>
              <p className="text-sm text-slate-300 mb-4">
                Connect with 2,000+ developers building RAG.
              </p>
              <button className="w-full bg-[#6467f2] text-white text-xs font-bold py-2 rounded hover:bg-[#6467f2]/90 transition-all">
                Reach out on Slack
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-600">
          <p>© 2024 ArborVect Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-white transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-white transition-colors" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
