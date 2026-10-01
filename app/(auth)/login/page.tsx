// app/(auth)/login/page.tsx
import { AuthHeader } from "@/components/auth/auth-header";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <AuthHeader prompt="Don't have an account?" linkLabel="Sign up" href="/register" />
      <LoginForm />
    </>
  );
}