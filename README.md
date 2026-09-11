# MotionGrid Technologies — Website

Next.js 16 + React 19 + TypeScript, styled as a design system (no CMS/mock data —
every page is real markup and copy, ready for you to plug real content into the
spots marked `TODO`).

**MotionGrid-only.** The former AutoField workshop-SaaS backdoor has been removed;
its schema and migrations live under `archive/` for historical reference only.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Copy `.env.example` to `.env.local` and fill in the MotionGrid Supabase + service
keys, Resend, Turnstile, and PostHog values before wiring data features.

> Note: the site uses Google Fonts (`next/font/google` — Fraunces, Inter,
> JetBrains Mono), so the machine you build/run on needs normal internet
> access to fonts.googleapis.com the first time it builds.

## Design system

- **Palette**: obsidian black background, brushed-chrome surfaces/text, and a
  single signal-orange accent (`#f2761d`, lifted from the logo) — used sparingly,
  always to mark the one "live" thing on a page.
- **Type**: Fraunces (italic serif, display headings) + Inter (body) +
  JetBrains Mono (uppercase eyebrows/labels).
- **Signature motif**: "The Filament" — flowing chrome circuit-lines with node
  dots, echoing the logo's strands. See `components/motifs/Filament.tsx` and
  `FilamentDivider.tsx`.
- All tokens live in `app/globals.css` under `@theme inline { ... }` (Tailwind v4
  CSS-first config) — change colors/fonts/radius there and they propagate
  everywhere.

## Structure

```
app/                    routes (App Router)
  about, products, technology, industries, blog,
  contact, sandbox, tools,
  technology/backend, technology/frontend, technology/other-technologies,
  legal/privacy, legal/terms, legal/cookies,
  login/                  Supabase Auth sign-in (MotionGrid project)
  dashboard/admin/        admin section (gated by proxy.ts)
    dashboard, seo, stats, marketing/blog, marketing/emails
  api/admin/              blog, marketing-emails, upload-image
components/
  ui/                     Button, Card, SectionHeading, Eyebrow, StatusPill,
                          Container, ContactLine, etc.
  motifs/                 Filament + FilamentDivider (signature graphic device)
  nav/                    Navbar, NavbarContainer, Footer, AdminSidebar
  sections/               PageHero, LegalDoc
  analytics/              PostHogProvider + CookieBanner
  admin/                  SeoScorer, SignOutButton
lib/
  site.ts                 nav items, footer links, founders, industries — EDIT HERE
  siteSupabaseServer.ts   MotionGrid cookie-based server auth client
  technologies.ts         tech stack list shown on Home + Technology
  lead-store.ts           Supabase lead store (demo requests + PayFast payments)
  marketing-email.ts      Resend marketing/lead email sender
  marketing-emails-store.ts  marketing email drafts (Tiptap editor)
  blog-store.ts           blog posts/categories/authors store
  rate-limiter.ts         Postgres-backed check_rate_limit RPC
  email-templates/        marketing + contact email templates
  cn.ts                   clsx + tailwind-merge helper
proxy.ts                  auth/session gate (runs before /login + /dashboard/*)
migrations/               MotionGrid migrations only
archive/                  archived Autofield schema + migrations
types/database.ts         generated from the MotionGrid Supabase project
```

## Auth & admin

- `/login` authenticates against the **MotionGrid** Supabase project.
- A Custom Access Token Hook (`public.custom_access_token_hook`) reads
  `profiles.role` and injects `app_metadata.role` into the JWT.
- `/dashboard/admin/*` requires `admin` or `super_admin` (checked in `proxy.ts`
  and the admin layout).
- The home navbar shows **Sign In** when logged out and a profile icon +
  **Log out** when logged in.

## Things to fill in before launch

- `app/legal/*` — have a lawyer review before publishing; company registration
  details, jurisdiction, and dates are placeholders.
- `.env.local` — fill in MotionGrid Supabase, Resend, Turnstile, and PostHog keys.

## Growth infrastructure already wired

- Security headers (HSTS, X-Frame-Options, etc.) in `next.config.ts`.
- PostHog analytics scaffold + cookie consent banner.
- Google Search Console — verification tag wired via `NEXT_PUBLIC_GSC_VERIFICATION`.
- Cloudflare Turnstile on public forms + login.
- Postgres-backed rate limiting (login, forms, API).
- Fully responsive, keyboard-focus visible, reduced-motion respected.

## Scheduling, sequences, scoring & analytics

The contact page's primary flow is a **15-minute slot picker** (no Cal.com
dependency — the grid, validation, and double-booking guard are all in-house):

- `lib/booking-slots.ts` — authoritative slot rules (Mon–Fri, 09:00–16:00
  SAST, quarter-hour grid, 1h lead time, 30-day window).
- `app/api/booking/availability` — public per-date availability feed.
- `lib/actions/dashboard.ts` (`bookDemoSlot`) — validates and stores the
  booking (`demo_bookings` + a scored `demo_requests` row), then sends the
  confirmation **with a generated .ics calendar invite** (`lib/ics.ts`) plus
  an admin notification.
- Bookings surface on the admin dashboard with cancel/complete actions.

**Welcome email sequence** (`lib/email-sequences.ts`): every new lead is
enrolled at intake; step 1 sends immediately, steps 2 (48h) and 3 (120h) are
released by the cron route:

```bash
curl -X POST https://motiongrid.co.za/api/cron/email-sequences \
  -H "Authorization: Bearer $CRON_SECRET"
```

Schedule it hourly (Vercel Cron, GitHub Actions, or any crontab). Progress
lives in the `email_sequence_enrollments` table.

**Lead scoring** (`lib/lead-scoring.ts`): every demo request is scored 0–100
at intake (company, business email domain, phone, message depth, intent
keywords, budget mentions) and tiered hot/warm/cold — shown as a badge on the
admin dashboard and averaged on the analytics page.

**Analytics** (`/dashboard/admin/analytics`): live revenue (PayFast), lead
and booking trends, MRR and churn from the `subscriptions` table.

## Client-app kill switch

Every Next.js app MotionGrid hosts for a client ships
`lib/kill-switch-middleware.ts` (copy it into the client app — it is
deliberately self-contained). The middleware checks this site's status feed:

```
GET /api/subscription-status?domain=<client-domain>
Header: x-kill-switch-key: <KILL_SWITCH_API_KEY>
```

and redirects visitors to the suspension page when the client's subscription
is `past_due`/`cancelled`. Fail-open on feed errors, 5-minute in-memory
cache, `clients`/`subscriptions` tables hold the source of truth.

## Deliberately left for later (per the brief)

PayFast ITN webhook/data flow, customer login portal, public status page, and API
documentation — build these once there's a live, paying product to support.