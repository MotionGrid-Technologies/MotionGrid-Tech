"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { supabase } from "@/lib/supabase";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setMessage(error?.message ?? "Unable to sign in.");
      setPending(false);
      return;
    }

    const role = data.session.user.app_metadata?.role;
    if (role !== "super_admin") {
      await supabase.auth.signOut();
      setMessage("This account does not have Super Admin access.");
      setPending(false);
      return;
    }

    router.replace(next.startsWith("/adminj2-v1/autofield") ? next : "/adminj2-v1/autofield");
    router.refresh();
  }

  return (
    <section className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-black px-6 py-16">
      <Container className="max-w-md">
        <div className="rounded-[var(--radius-mg-lg)] border border-hairline bg-black p-8">
          <div className="mb-8 flex flex-col gap-2">
            <span className="mg-eyebrow">Admin</span>
            <h1 className="font-display text-3xl text-chrome-100">Sign in</h1>
            <p className="text-sm text-chrome-500">
              Restricted area. Authorized admins only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div>
              <label className="mg-eyebrow mb-2 block" htmlFor="email">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-3 focus-within:border-signal/60">
                <Mail size={14} className="text-chrome-700" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mg-eyebrow mb-2 block" htmlFor="password">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-3 focus-within:border-signal/60">
                <Lock size={14} className="text-chrome-700" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:outline-none"
                  placeholder="Password"
                />
              </div>
            </div>

            {message && (
              <p aria-live="polite" className="text-sm text-signal">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-[var(--radius-mg)] bg-signal px-5 py-3 text-sm font-medium text-graphite transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
