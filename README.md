# MotionGrid Technologies — Website

Next.js 16 + React 19 + TypeScript, styled as a design system (no CMS/mock data —
every page is real markup and copy, ready for you to plug real content into the
spots marked `TODO`).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

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
app/                  routes (App Router)
  about, products, technology, industries,
  contact, sandbox, tools,
  technology/backend, technology/frontend, technology/other-technologies,
  legal/privacy, legal/terms, legal/cookies,
  security, accessibility,
  adminj2-v1/          admin section (gated by proxy.ts)
    login, dashboard, autofield, seo, stats
components/
  ui/                 Button, Card, SectionHeading, Eyebrow, StatusPill,
                      Container, ContactLine, etc.
  motifs/             Filament + FilamentDivider (signature graphic device)
  nav/                Navbar, Footer, AdminSidebar
  sections/           PageHero, LegalDoc
  analytics/          PostHogProvider (inert until a key is set)
  admin/              SignOutButton
lib/
  site.ts             nav items, footer links, founders, industries — EDIT HERE
  technologies.ts     tech stack list shown on Home + Technology
  db.ts               SQLite store (demo requests + PayFast payments)
  admin-auth.ts       admin session + hardcoded credentials
                      (move to env vars before launch)
  cn.ts               clsx + tailwind-merge helper
data/                 motiongrid.db (SQLite file)
proxy.ts              admin auth gate (runs before /adminj2-v1/* routes)
next.config.ts        security headers + better-sqlite3 serverExternalPackages
.env.example          PostHog + Google Search Console keys (all optional)
```

## Things to fill in before launch

Search the codebase for `TODO` — the main ones:

- `app/legal/*`, `app/security/page.tsx`, `app/accessibility/page.tsx` —
  have a lawyer review before publishing; company registration details,
  jurisdiction, and dates are placeholders.
- `.env.example` — copy to `.env.local` and fill in PostHog + Search Console
  keys when ready (site works fully with these unset).

## Growth infrastructure already wired

-
- Security headers (HSTS, X-Frame-Options, etc.) in `next.config.ts`.
- PostHog analytics scaffold — disabled until `NEXT_PUBLIC_POSTHOG_KEY` is set.
- Google Search Console — verification tag wired via `NEXT_PUBLIC_GSC_VERIFICATION`.
- Fully responsive, keyboard-focus visible, reduced-motion respected.

## Deliberately left for later (per the brief)

PayFast integration, customer login portal, public status page, and API
documentation — build these once there's a live, paying product to support.


## Note i already created the admin page
this is how u access it
 http://localhost:3000/adminj2-v1/login
 then u use your real email adress  (the one u use to communicate with me)
 the password is harcoded for now (motiongrid2026)
made a diabolical name for the admin folder jst so its harder to guess

Set the real production domain (url) — line 13
Must fix before any public launch
1. Move admin credentials + session secret out of source into env vars (lib/admin-auth.ts
2. Remove pre-filled email from login form
3. Add server-side auth check to admin Server Actions (app/adminj2-v1/actions.ts)
4. Implement device/IP allowlist for admin (your todo)
5. Lawyer review of all 3 legal pages; fill in real hosting/jurisdiction/retention details
6. Set real production domain + email in lib/site.ts
7. Confirm founder phone numbers, emails, and add real headshot photos 8. Rewrite founder bios (fix typos)
9. Set accessibility updated date + list known gaps
10. Name real hosting provider on Security page
11. Create og-image.png (1200×630) and confirm apple-touch-icon asse

my todo
need to fix the images on the technology  (size and shape) make them display properly
need to fix how the autofield pic is displayed
need to add the extra security layer of only allowing only 2 specific PCs to access admin page
need to improve our Biographies
need to creeate database on supabase and link our payfast stuff there
Je todo
need to add superAdmin of autofield
need to create Blogs page
security n trust page
Accessibility
