# MotionGrid Technologies — TODO / Roadmap

Last updated: 2026-09-07 (audited against codebase)

---

## 🚀 PRODUCTION EXECUTION PLAN (locked 2026-09-06)

Final consolidated plan. Decisions are locked below — do not re-litigate.

### ⚠️ Architecture — TWO separate Supabase projects (critical)

This repo houses **MotionGrid's marketing site** BUT also serves as the **Autofield SuperAdmin backdoor**. Two distinct Supabase projects exist:

| Deployment | Project | Env vars |
|---|---|---|
| **MotionGrid** (this marketing site) | MotionGrid Supabase | `SITE_SUPABASE_URL`, `SITE_SUPABASE_SERVICE_ROLE_KEY` (server-only); `NEXT_PUBLIC_SITE_SUPABASE_URL`, `NEXT_PUBLIC_SITE_SUPABASE_ANON_KEY` (client, only if a browser client is ever added) |
| **Autofield** (SuperAdmin backdoor) | Autofield Supabase (`ueqptaohroqxmwrddicj`) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Edge Function** (`supabase/functions/custom-access-token`) | Autofield Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Deno runtime config) |

- `super_admin` login authenticates against **Autofield's** Supabase (`/login`).
- MotionGrid's own identity/auth (future client portal, marketing data) lives in **MotionGrid's** Supabase — NOT the same project.
- Do **not** collapse these. The MotionGrid project uses the `SITE_SUPABASE_*` prefix; the Autofield app keeps the `NEXT_PUBLIC_SUPABASE_*` prefix; the Edge Function reads plain `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` from its own runtime config.

> 🚧 **BLOCKER (resolved):** MotionGrid's own Supabase project credentials are present in the env (`SITE_SUPABASE_URL`, `SITE_SUPABASE_SERVICE_ROLE_KEY`). Create the `demo_requests`/`payfast_payments` tables via `migrations/20260906_motiongrid_lead_capture.sql` before Phase 3 marketing-email persistence.

---

### Phase 1 — Security Blockers & Env (P0)

- [x] Create `.env.local` (never commit; add to `.gitignore`)
- [ ] **Rotate all exposed secrets** — Resend `re_...` (shared in chat) + Supabase anon/service keys (present in git history)
- [x] Add **MotionGrid** Supabase vars (own project): `SITE_SUPABASE_URL`, `SITE_SUPABASE_SERVICE_ROLE_KEY` (server), and `NEXT_PUBLIC_SITE_SUPABASE_URL`/`NEXT_PUBLIC_SITE_SUPABASE_ANON_KEY` if a browser client is introduced
- [x] Keep Autofield Supabase vars as-is (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `ueqptaohroqxmwrddicj`, `SUPABASE_SERVICE_ROLE_KEY`)
- [x] Add Resend vars:
  - `RESEND_API_KEY` (rotated)
  - `EMAIL_FROM=hi@updates.motiongrid.co.za` (verified Resend sender; replies route to `hi@motiongrid.co.za`)
  - `EMAIL_DISPLAY_NAME="Motion Grid"`
  - `ADMIN_NOTIFICATION_EMAIL=hello@motiongrid.co.za`
- [x] Add `NEXT_PUBLIC_SITE_URL=https://motiongrid.co.za`
- [x] Add Turnstile vars: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- [x] Harden `/sandbox` — CSP meta tag + `event.origin` validation in `CodePlayground.tsx` (P0 XSS)
- [x] Add Cloudflare Turnstile to public contact/demo form (server-side token verify)
- [x] Wire **in-memory** rate limiter (`lib/rate-limiter.ts`) into public form + login + API routes

---

### Phase 2 — Route Restructure & Auth Unification (P1)

- [x] **Physically move** `app/adminj2-v1/...` → `app/dashboard/admin/...` (no rewrites, clean structure)
- [x] **Break** old `/adminj2-v1/*` URLs (404 — no redirects, intended for security)
- [x] Delete `lib/admin-auth.ts` entirely (hardcoded HMAC session)
- [x] Delete old `proxy.ts` (dead custom HMAC session gate). NOTE: a new `proxy.ts` now exists — it is the Next.js 16 role-redirect proxy, not the old HMAC gate.
- [x] Auth = **Supabase Auth only** with role claims (`super_admin`, `admin`, `client`) (unified `app/login` uses Supabase SSR)
- [x] Note: superadmin backdoor login authenticates against **Autofield** Supabase (unchanged semantics, just moved path)
- [x] Proxy (Next.js 16 `proxy.ts`, formerly middleware): `/dashboard` → read JWT role → redirect:
  - `super_admin` → `/dashboard/admin/autofield`
  - `admin` → `/dashboard/admin/dashboard`
- [ ] Navbar: show **Sign In** (logged out) / **profile icon + logout** (logged in) — desktop **and** mobile
- [ ] Profile icon click → `/dashboard`
- [x] **Skip client dashboard entirely** — no `/dashboard/client` skeletons

---

### Phase 3 — Email / Resend Integration (P2)

- [x] Connect Resend, sender `hi@updates.motiongrid.co.za` (verified; replies route to `hi@motiongrid.co.za`)
- [x] Update `lib/email.ts` fallback sender → `Motion Grid <hi@updates.motiongrid.co.za>` (Autofield workshops keep their own `email_from` override)
- [x] Contact/demo form: **log to Supabase** (`demo_requests`) **AND** send Resend email (admin notification to `hello@motiongrid.co.za` + prospect confirmation)
- [x] Add missing default templates: `quote_notification_admin`, `quote_submitted_confirmation`, `contact_form`
- [x] Add MotionGrid marketing templates: `contact_form_submission`, `demo_request_confirmation`
- [x] Build **Tiptap editor/viewer for MotionGrid marketing emails ONLY**
  - deps: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-underline`, `@tiptap/extension-text-align`, `@tiptap/extension-text-style`, `@tiptap/extension-color`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `isomorphic-dompurify`
  - `EmailEditor.tsx`, `EmailPreview.tsx` (sandboxed iframe), merge-tag toolbar
  - Marketing email admin page under `/dashboard/admin/marketing/emails`
- [x] Marketing email API routes: `app/api/admin/marketing-emails/route.ts` (list/create), `[id]/route.ts` (get/update/delete), `[id]/send/route.ts` (test send). NOTE: preview is client-side (`EmailPreview` + shared merge-tag renderer), so no `/preview` route was needed.
- [x] Leave existing `EmailTemplatesForm.tsx` (Autofield workshop templates) **as-is** (raw HTML)
- [x] **Skip** custom auth emails — use Supabase dashboard HTML for verification/reset

> 🚧 Marketing-template persistence: decide table location once MotionGrid Supabase project is provisioned (Phase 1 blocker).

---

### Phase 4 — Component Polish (P3)

- [x] Create `app/not-found.tsx` + `app/error.tsx` (styled, use `Container` + `Button`, guide back home)
- [ ] Create OG image (`public/og-image.png` 1200×630) or `app/opengraph-image.tsx`
- [x] Add `priority` to mobile-navbar logo image
- [x] JSON-LD `SoftwareApplication` structured data in `app/layout.tsx` (via `components/JsonLd.tsx`)
- [ ] GA4 gated behind cookie consent (optional; PostHog already present)
- [ ] Fix image sizing on Technology pages + AutoField product image

---

## 🔍 Site Audit — Codebase Health & Architecture (P0 → P5)

Findings from the 2026-09-06 full-site audit. Knock these out before scaling admin.

### P0 — Security blockers (fix before any public admin access)
> ✅ Superseded by **PRODUCTION EXECUTION PLAN → Phase 1 & Phase 2** above.
- [x] Delete `lib/admin-auth.ts` entirely (hardcoded HMAC credentials) — see Phase 2
- [x] Delete old `proxy.ts` (custom HMAC session gate) — see Phase 2 (new `proxy.ts` is the Next.js 16 role proxy)
- [x] Wire rate limiter into login + API routes — see Phase 1
- [x] Harden `/sandbox` XSS — see Phase 1

### P1 — Route & admin architecture restructure
> ✅ Superseded by **PRODUCTION EXECUTION PLAN → Phase 2** above.
- [x] Physically move `adminj2-v1` → `dashboard/admin`; break old URLs (no redirects) — see Phase 2
- [x] Middleware role-based redirect after login — see Phase 2 (now `proxy.ts`)
- [ ] Add "Sign in" / profile button to navbar — see Phase 2
- [x] Merge/delete duplicate dashboard (`dashboard` vs `autofield/dashboard` copy-paste dupes) — duplicate removed in restructure
- [ ] Fix `/api/admin/workshops` naming (requires `super_admin`, not `admin`)

### P2 — Sandbox & XSS security
- [x] Harden `CodePlayground.tsx`: `event.origin` validation, restrict `postMessage`, add CSP meta tag, validate `level`
- [ ] Sanitize/restrict `EmailTemplatesForm.tsx` `dangerouslySetInnerHTML` preview (admin-controlled HTML)

### P3 — Component reuse & cleanup
- [-] Unify two Button systems: `components/ui/Button.tsx` vs `components/ui/buttons.tsx` (both files still exist; `Button.tsx` is used by marketing site, `buttons.tsx` elsewhere)
- [ ] Create shared `Modal` primitive (7+ modals re-implement the same shell)
- [ ] Create shared form field components (`Input`, `TextArea`, `Select`, `Field`, `FormError`)
- [ ] Merge duplicate vehicle forms: `admin/AddVehicleModal.tsx` + `settings/VehicleFormModal.tsx`
- [-] Consolidate `StatusBadge.tsx` + `StatusPill.tsx` (both components exist)
- [ ] Promote `HomepageContentForm` local `TextField`/`TextArea` helpers to `components/ui/`
- [ ] Remove dead `/dashboard/admin/*` links in `components/admin/*.tsx` (routes don't exist)

### P4 — Placeholder & data cleanup
- [-] Audit `lib/site-config.ts` (stale "Top Life Mechanics" tenant data, phone, address, VAT) (still contains stale defaults)
- [-] Audit `lib/homepage-content.ts` defaults (Pexels stock images, `{city}` placeholders) (file exists with placeholder content)
- [-] Neutralize default tenant values in `autofield/workshops` + `settings` ("Autofields Technics", `+27784802796`, `#3B82F6`) (seeded templates still reference `#3B82F6` and workshop defaults are tenant-specific)
- [x] Fix stale "No auth yet" comments in dashboard pages + `actions.ts` (files deleted in `adminj2-v1` restructure)

### P5 — Customer dashboard readiness (future)
> ⚠️ **Skipped for now** — do NOT build `/dashboard/client` or its skeletons (decision locked 2026-09-06).
- [ ] Build shared `DashboardLayout` (`{ role, navItems, children }`) — only when client dashboard is restored
- [ ] Centralize duplicated JWT helpers (`getRoleFromJWT` / `getRoleFromSession`)

---

## ⚡ Supabase Migration (PREREQUISITE — do this first)

The current codebase runs on SQLite + hardcoded admin auth for local development only.
Most of this will be removed once Supabase + Vercel are connected for security.

### Supabase Project Setup
- [ ] Create Supabase project + connect to Vercel
- [ ] Run initial schema migration in Supabase SQL Editor
- [ ] Set `SUPABASE_URL` + `SUPABASE_ANON_KEY` env vars in Vercel
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to client)

### Auth Migration
- [x] Delete `lib/admin-auth.ts` (hardcoded credentials + HMAC session)
- [x] Delete old `proxy.ts` (custom session gate) — new `proxy.ts` is the Next.js 16 role proxy
- [x] Replace with Supabase Auth + Next.js proxy using `@supabase/ssr` (`app/login` + `proxy.ts`)
- [x] Migrate admin login to Supabase Auth (`app/login`)
- [ ] Create `admin` role in Supabase with RLS policies

### Database Migration
- [x] Delete `lib/db.ts` (SQLite)
- [x] Delete `data/motiongrid.db`
- [x] Remove `better-sqlite3` from `package.json`
- [x] Remove `serverExternalPackages: ["better-sqlite3"]` from `next.config.ts`
- [x] Create Supabase tables:
  - [x] `demo_requests` (name, company, email, phone, message, status, created_at)
  - [-] `payfast_payments` (pf_payment_id, amounts, status, timestamps) (migration exists; no ITN webhook/data flow yet)
  - [ ] `subscriptions` (client_id, plan, status, amount, next_billing_date)
  - [ ] `clients` (name, email, domain, project_status, workshop_slug)
- [-] Enable Row Level Security on all tables (`demo_requests`/`payfast_payments` have RLS; broader audit needed)
- [ ] Create `public.current_workshop_id()` helper for multi-tenant isolation
- [ ] Set up Supabase Storage for client asset uploads

### Type Safety
- [x] Run `supabase gen types` to generate `types/database.ts` (includes `demo_requests`/`payfast_payments`)
- [-] Replace all SQLite type imports with Supabase types (most replaced; verify no SQLite imports remain)

---

## Phase 0: Launch Blockers

- [ ] Lawyer review of all 3 legal pages; fill real hosting, jurisdiction, retention details
- [x] Set real production domain + email in `lib/site.ts` (`https://motiongrid.co.za`, `hi@motiongrid.co.za`)
- [-] Confirm founder phone numbers, emails, headshots; rewrite bios (info present; Mnqobi bio still has `// Todo need better bio`)
- [ ] Name real hosting provider on Security page
- [ ] Set accessibility updated date + list known gaps
- [ ] Create/fix `og-image.png` (1200×630) and apple-touch-icon assets
- [ ] Fix image sizing on Technology pages + AutoField product image
- [x] Cookie consent banner + PostHog opt-in flow
- [x] Remove pre-filled email from admin login form

---

## Phase 1: Lead Capture & Trust
> ⚠️ Blocked until Supabase Migration is complete (Phase 1.2 depends on `demo_requests` table)

### 1.1 Sandbox Lead Magnets (`/sandbox`)
- [ ] **VIN / License Plate Decoder**
  - Input field for SA-style license plate or VIN
  - Integrate vehicle data API (NHTSA or local SA provider)
  - Return make, model, year, engine details
  - Gate full result behind email capture
- [ ] **Digital Garage Website Auditor**
  - URL input for workshop website
  - Run automated Lighthouse / PageSpeed API check
  - Display speed, mobile-friendliness, SEO scores out of 100
  - Gate full PDF report behind email capture
  - Auto-email PDF via Brevo, Resend or SendGrid

### 1.2 Contact / Demo Flow
- [x] Wire contact form to Supabase `demo_requests` table
- [x] Email notification to admin on new demo request (Resend via `lib/marketing-email.ts`)
- [x] Admin dashboard: view, update status, filter, delete demo requests
- [x] Auto-responder confirmation email to prospect

### 1.3 Social Proof
- [ ] Testimonials section on homepage or `/testimonials`
- [ ] Client logos marquee
- [ ] Case studies page (`/case-studies`)
- [ ] Review system with admin approval

---

## Phase 2: AutoField Product Demo
> ⚠️ Phase 2.2 depends on Supabase realtime (post-migration)

### 2.1 Interactive Quoting Engine
- [ ] Embed stripped-down quote builder on `/products` (or `/autofield`)
- [ ] Add fake customer + line items (e.g., "Brake Pads R 850")
- [ ] Generate branded PDF quote on click
- [ ] CTA: "Want this for your workshop? Book a free demo"

### 2.2 Customer Booking Simulator
- [ ] Split-screen widget on `/products`
- [ ] Left: customer-facing booking form (name, service type, date)
- [ ] Right: live AutoField dashboard ticket
- [ ] Supabase realtime to populate dashboard side instantly
- [ ] Pre-fill with realistic demo data

---

## Phase 3: Client Portal & Sales
> ⚠️ Blocked until Supabase Auth + `clients` table exist

### 3.1 Dynamic Proposals
- [ ] `/proposal/[client-slug]` secure route
- [ ] Live interactive quote with toggleable features (+R500/mo for SMS, etc.)
- [ ] Price updates in real time as options toggle
- [ ] Digital signature capture (SignWell API or canvas-based)
- [ ] Proposal approval auto-creates project record

### 3.2 Project Roadmap Tracker
- [ ] Client login via Supabase Auth (separate role from admin)
- [ ] Kanban board: Design → Development → Testing → Live
- [ ] Comment + feedback per task
- [ ] File upload to Supabase Storage (logos, assets, content)
- [ ] Pay deposit via PayFast integration

### 3.3 Smart Scheduling
- [ ] Integrate Cal.com or Calendly embed on `/contact`
- [ ] Replace generic form with "pick a 15-min slot" flow
- [ ] Auto-calendar invite + confirmation email on booking
- [ ] WhatsApp share link for "Book a slot" texts

---

## Phase 4: Billing Engine (Monthly Bind)
> ⚠️ Blocked until Supabase + PayFast integration

### 4.1 Payment Rails
- [ ] PayFast tokenization for recurring credit/debit card payments
- [ ] Stitch integration for automated bank account EFT debits
- [ ] PayShap support for instant push payments
- [ ] Manual EFT / invoice payment fallback

### 4.2 Subscription Management
- [ ] Subscription plans in Supabase: Hosting, Maintenance, Support, Dev Retainer
- [ ] Automated monthly invoice generation
- [ ] Invoice history in client portal
- [ ] Payment retry logic (failed payments)
- [ ] Credit notes and discounts support

### 4.3 Hosting Management
- [ ] Hosting plan selector on website
- [ ] Automated monthly hosting invoices
- [ ] Domain status tracking
- [ ] Usage metrics dashboard (bandwidth, storage, uptime)

---

## Phase 5: Email Communications
> ⚠️ Tie email triggers to Supabase events (Edge Functions or database webhooks)

- [ ] Welcome email sequence for new leads
- [ ] Demo request confirmation + calendar invite
- [ ] Proposal sent / viewed / signed notifications
- [ ] Invoice sent / paid / overdue notifications
- [ ] Failed payment dunning sequence (3-day, 7-day, 14-day)
- [ ] Newsletter / insights broadcast
- [ ] WhatsApp Business API integration for SA market
- [ ] SMS notifications via Twilio or Clickatell

---

## Phase 6: Client "Kill Switch"
> ⚠️ Depends on Supabase `subscriptions` table + client app middleware

- [ ] Supabase `subscriptions.status` field + webhook on payment failure
- [ ] Middleware check in all client Next.js apps against Supabase subscription status
- [ ] Auto-redirect to `hosting-suspended.motiongrid.co.za` if `past_due` exceeds threshold
- [ ] Suspension page with payment update form
- [ ] Auto-restore service after payment clears
- [ ] Audit log of all suspensions and restorations

---

## Phase 7: Content & Marketing

- [ ] Blog / Insights (`/blog`) with MDX posts
- [ ] SEO analyzer + admin dashboard
- [ ] Open Graph image generation for blog + pages
- [ ] Sitemap + robots.txt automation
- [ ] Referral / affiliate program
- [ ] Careers / jobs board

---

## Phase 8: Operations & Support

- [ ] Help desk / ticket system
- [ ] Live chat widget (e.g., Crisp, Intercom, or custom)
- [ ] FAQ chatbot for common questions
- [ ] CRM integration (HubSpot or Pipedrive)
- [ ] Lead scoring
- [ ] Admin analytics dashboard (revenue, leads, MRR, churn)

---

## Phase 9: Compliance & Security

- [ ] POPIA compliance controls
- [ ] Data retention policy automation
- [ ] Right-to-be-forgotten workflow
- [ ] Security headers audit
- [ ] Penetration test results page
- [ ] Public status page (`/status`)

---

## Phase 10: Platform & DevOps

- [ ] AutoField SuperAdmin panel (manage all workshops from one dashboard)
- [ ] White-label onboarding wizard (business name, colors, logo, domain)
- [ ] Backup & restore console
- [ ] API documentation for AutoField public API
- [ ] Deployment dashboard (client sites status, uptime, last deploy)
- [ ] Internal time/expense tracking per client project
- [ ] Multi-tenant architecture for all products
