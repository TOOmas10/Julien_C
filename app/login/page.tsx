import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { signup } from "@/lib/actions/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <LoginForm signup={signup} />
    </div>
  );
}
