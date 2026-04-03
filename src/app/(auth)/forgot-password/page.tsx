import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email tied to your host account and we'll send you a secure reset link."
      footer={
        <p className="text-sm text-ink-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-brand hover:text-brand-dark">
            Back to login
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
