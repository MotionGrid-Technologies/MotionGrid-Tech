"use client";

import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { signIn, type SignInState } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const initialState: SignInState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(signIn, initialState);

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

          <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="next" value={next} />

            <div>
              <label className="mg-eyebrow mb-2 block" htmlFor="email">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-3 focus-within:border-signal/60">
                <Mail size={14} className="text-chrome-700" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue="Mnqobintuli@motiongrid.co.za"
                  className="w-full bg-transparent py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
              {state.errors?.email && (
                <p className="mt-2 text-xs text-signal">{state.errors.email}</p>
              )}
            </div>

            <div>
              <label className="mg-eyebrow mb-2 block" htmlFor="password">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-3 focus-within:border-signal/60">
                <Lock size={14} className="text-chrome-700" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-transparent py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:outline-none"
                  placeholder="Password"
                />
              </div>
              {state.errors?.password && (
                <p className="mt-2 text-xs text-signal">{state.errors.password}</p>
              )}
            </div>

            {state.message && !state.ok && (
              <p aria-live="polite" className="text-sm text-signal">
                {state.message}
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
