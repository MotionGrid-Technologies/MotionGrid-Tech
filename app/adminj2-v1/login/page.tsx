import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = verifySession(session);
  if (user) {
    const next = (await searchParams).next;
    redirect(next && next.startsWith("/adminj2-v1") ? next : "/adminj2-v1/dashboard");
  }

  const next = (await searchParams).next ?? "/adminj2-v1/dashboard";
  return <LoginForm next={next} />;
}