"use client";

import { useActionState, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Lock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { signInWithPassword, type LoginState } from "./actions";

export function LoginForm() {
  const initialState: LoginState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(signInWithPassword, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

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

          <form
            action={formAction}
            onSubmit={() => {
              // Reset the widget so the next submission requires a fresh
              // challenge (including after validation or auth failures).
              setTurnstileToken("");
              turnstileRef.current?.reset();
            }}
            className="flex flex-col gap-5"
          >
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
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-transparent py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:outline-none"
                  placeholder="Password"
                />
              </div>
            </div>

            <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
              options={{
                action: "login",
                theme: "dark",
                size: "normal",
                responseField: false,
              }}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />

            {state.message && (
              <p aria-live="polite" className="text-sm text-signal">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || !turnstileToken}
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
