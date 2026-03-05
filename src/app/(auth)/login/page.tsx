import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="glass-card rounded-xl p-8 lg:p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
          Welcome back
        </h1>
        <p className="text-slate-400 text-sm">
          Enter your credentials to access your account
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
