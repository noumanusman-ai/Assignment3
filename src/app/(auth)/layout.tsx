import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen flex flex-col bg-[#0a0a0a] text-slate-100 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .glass-card {
              background: rgba(10, 10, 10, 0.8);
              backdrop-filter: blur(12px);
              border: 1px solid #262626;
              box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.15);
            }
            .glow-border:focus-within {
              border-color: #6366f1;
              box-shadow: 0 0 0 1px #6366f1;
            }
          `,
        }}
      />

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-[#6366f1]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-[#6366f1]/5 rounded-full blur-[120px]" />
      </div>

      {/* Header with logo */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">
              account_tree
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            ArborVect
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 text-center">
        <p className="text-xs text-slate-600 uppercase tracking-widest">
          © 2024 ArborVect. Built for the modern web.
        </p>
      </footer>
    </div>
  );
}
