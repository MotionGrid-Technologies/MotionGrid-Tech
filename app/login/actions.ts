"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSiteSupabaseServerClient, getRoleFromJWT } from "@/lib/siteSupabaseServer";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limiter";

export type LoginState = {
  ok: boolean;
  message: string;
};

export async function signInWithPassword(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");

  // Rate limit: 5 attempts per IP per 15 minutes (brute-force protection).
  const ip = getClientIpFromHeaders(await headers());
  const { allowed } = await checkRateLimit(`login:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return { ok: false, message: "Too many attempts. Please wait a while and try again." };
  }

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken, "login"))) {
    return { ok: false, message: "CAPTCHA verification failed. Please try again." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (password.length === 0) {
    return { ok: false, message: "Enter your password." };
  }

  const supabase = await createSiteSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return { ok: false, message: "Invalid email or password." };
  }

  const { data: claimsData } = await supabase.auth.getClaims(data.session.access_token);
  const role = getRoleFromJWT(claimsData?.claims);

  if (role === "admin" || role === "super_admin") {
    redirect("/dashboard/admin/dashboard");
  }
  return { ok: false, message: "You don't have admin access." };
}

export async function signOut(): Promise<void> {
  const supabase = await createSiteSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
