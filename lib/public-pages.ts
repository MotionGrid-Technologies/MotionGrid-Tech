// Public routes the admin SEO scorer can grade. Only the route + a human
// label live here — the actual copy/body is fetched live from each page at
// scoring time so this can never drift from what's really being served.

export const publicPages: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/products", label: "Products" },
  { path: "/tools", label: "Micro-Tools" },
  { path: "/faq", label: "FAQ" },
  { path: "/technology", label: "Technology" },
  { path: "/technology/frontend", label: "Technology · Frontend" },
  { path: "/technology/backend", label: "Technology · Backend" },
  { path: "/technology/other-technologies", label: "Technology · Other" },
  { path: "/industries", label: "Industries" },
  { path: "/blog", label: "Blog" },
  { path: "/testimonials", label: "Testimonials" },
  { path: "/contact", label: "Contact" },
  { path: "/sandbox", label: "Live Sandbox" },
  { path: "/legal/privacy", label: "Privacy Policy" },
  { path: "/legal/terms", label: "Terms of Service" },
  { path: "/legal/cookies", label: "Cookie Policy" },
];