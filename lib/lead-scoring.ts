// ---------------------------------------------------------------------------
// Lead scoring (TODO Phase 8).
//
// A transparent, rule-based 0-100 score applied to every demo request at
// intake. Higher = hotter. The breakdown is stored alongside the score so
// the admin dashboard can show exactly why a lead ranks the way it does.
//
// Tiers:
//   hot  >= 70  — reach out same day
//   warm >= 40  — follow up within 48h
//   cold <  40  — nurture via the welcome sequence
// ---------------------------------------------------------------------------

export type LeadTier = "hot" | "warm" | "cold";

export interface LeadScoreInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

export interface LeadScoreResult {
  score: number;
  tier: LeadTier;
  breakdown: { rule: string; points: number }[];
}

// Free mailbox providers — a custom domain signals a real business.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "proton.me",
  "webmail.co.za",
  "gmail.co.za",
]);

// Buying-intent keywords in the message.
const INTENT_KEYWORDS = [
  "quote",
  "budget",
  "urgent",
  "asap",
  "invoice",
  "quoting",
  "booking",
  "appointment",
  "portal",
  "website",
  "app",
  "integration",
  "subscription",
  "payment",
  "dashboard",
  "automation",
  "ecommerce",
  "e-commerce",
  "store",
];

export function scoreLead(input: LeadScoreInput): LeadScoreResult {
  const breakdown: { rule: string; points: number }[] = [];
  let score = 0;

  const add = (rule: string, points: number) => {
    if (points === 0) return;
    score += points;
    breakdown.push({ rule, points });
  };

  // Company provided — a business context, not a personal enquiry.
  if (input.company.trim().length >= 2) add("company provided", 15);

  // Custom email domain — signals an established business mailbox.
  const domain = input.email.split("@")[1]?.toLowerCase() ?? "";
  if (domain && !FREE_EMAIL_DOMAINS.has(domain)) add("business email domain", 10);

  // Phone provided — a direct line to call back on.
  if (input.phone.replace(/\D/g, "").length >= 9) add("phone provided", 10);

  // Message depth — longer briefs usually mean real intent.
  const len = input.message.trim().length;
  if (len >= 120) add("detailed message (120+ chars)", 15);
  else if (len >= 40) add("clear message (40+ chars)", 10);

  // Buying-intent keywords — capped so keyword spam can't dominate.
  const lower = input.message.toLowerCase();
  const hits = INTENT_KEYWORDS.filter((k) => lower.includes(k));
  if (hits.length > 0) {
    add(`intent keywords (${hits.slice(0, 3).join(", ")})`, Math.min(hits.length * 5, 15));
  }

  // Named a specific budget figure.
  if (/r\s?\d{3,}|rand\s?\d{3,}|\d{3,}\s?rand/i.test(input.message)) {
    add("mentions a budget figure", 10);
  }

  score = Math.max(0, Math.min(100, score));

  const tier: LeadTier = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  return { score, tier, breakdown };
}

export const LEAD_TIER_LABEL: Record<LeadTier, string> = {
  hot: "Hot lead",
  warm: "Warm lead",
  cold: "Cold lead",
};
