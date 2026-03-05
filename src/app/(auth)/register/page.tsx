import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="glass-card rounded-xl p-8 lg:p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
          Create your account
        </h1>
        <p className="text-slate-400 text-sm">
          Get started with ArborVect in seconds
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
