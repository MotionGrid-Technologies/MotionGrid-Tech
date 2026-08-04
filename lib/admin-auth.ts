import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "mg_admin_session";

// Hardcoded for now — swap for a real auth provider before this is public.
const ADMIN_USERS: Record<string, string> = {
  "mnqobibog@gmail.com": "motiongrid2026",
  "princenube74@gmail.com": "motiongrid2026",
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SESSION_SECRET = "mg-admin-session-secret-change-me";

function sign(payload: string): string {
  const mac = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

function isValidSignature(token: string): boolean {
  const sep = token.lastIndexOf(".");
  if (sep < 0) return false;
  const payload = token.slice(0, sep);
  const mac = token.slice(sep + 1);
  const expected = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function authenticate(email: string, password: string): string | null {
  const key = email.trim().toLowerCase();
  const expected = ADMIN_USERS[key];
  if (!expected || expected !== password) return null;
  return key;
}

export function createSession(email: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  return sign(`${email}:${expires}`);
}

export function verifySession(
  token: string | undefined | null
): string | null {
  if (!token) return null;
  if (!isValidSignature(token)) return null;
  const sep = token.lastIndexOf(".");
  const payload = sep >= 0 ? token.slice(0, sep) : token;
  const [email, expiresStr] = payload.split(":");
  const expires = Number(expiresStr);
  if (!email || !expires || Number.isNaN(expires)) return null;
  if (Date.now() > expires) return null;
  return email;
}

export const SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);