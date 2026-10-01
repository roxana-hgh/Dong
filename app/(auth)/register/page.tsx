// app/(auth)/register/page.tsx
import { AuthHeader } from "@/components/auth/auth-header";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <>
      <AuthHeader prompt="Already have an account?" linkLabel="Log in" href="/login" />
      <RegisterForm />
    </>
  );
}