"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  deleteDemoRequest,
  insertDemoRequest,
  updateDemoRequestStatus,
  type DemoRequestStatus,
} from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  authenticate,
  createSession,
  verifySession,
} from "@/lib/admin-auth";

// ---------------------------------------------------------------------------
// Public submission — used by the contact "Book a demo" form.
// No auth: this is the site's intake form and is rate-limited by the platform.
// ---------------------------------------------------------------------------
export type DemoFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

async function requireAdminSession(): Promise<void> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySession(session)) {
    redirect("/adminj2-v1/login");
  }
}

export async function submitDemoRequest(
  _prev: DemoFormState,
  formData: FormData
): Promise<DemoFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Your name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "A valid email is required.";
  if (message.length < 5) errors.message = "Tell us a little about the problem.";
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  try {
    insertDemoRequest({ name, company, email, phone, message });
    revalidatePath("/adminj2-v1/dashboard");
  } catch (err) {
    console.error("submitDemoRequest failed", err);
    return { ok: false, message: "Something went wrong saving your request." };
  }

  return { ok: true, message: "Thanks — we'll be in touch shortly." };
}

// ---------------------------------------------------------------------------
// Admin mutations. ⚠️ Auth is intentionally skipped for now; add a session
// check here before this is exposed publicly.
// ---------------------------------------------------------------------------

export async function setDemoRequestStatus(
  id: number,
  status: DemoRequestStatus
): Promise<void> {
  await requireAdminSession();
  updateDemoRequestStatus(id, status);
  revalidatePath("/adminj2-v1/dashboard");
}

export async function removeDemoRequest(id: number): Promise<void> {
  await requireAdminSession();
  deleteDemoRequest(id);
  revalidatePath("/adminj2-v1/dashboard");
}

// ---------------------------------------------------------------------------
// Admin auth — hardcoded credentials for now. See lib/admin-auth.ts.
// ---------------------------------------------------------------------------

export type SignInState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email.";
  if (password.length === 0) errors.password = "Enter your password.";
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  const user = authenticate(email, password);
  if (!user) {
    return { ok: false, message: "Invalid email or password." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  const next = String(formData.get("next") ?? "").trim();
  redirect(next.startsWith("/adminj2-v1") ? next : "/adminj2-v1/dashboard");
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/adminj2-v1/login");
}
