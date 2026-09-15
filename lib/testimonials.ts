// ---------------------------------------------------------------------------
// Static testimonials for the marketing site (/testimonials).
//
// These are hand-picked, editorial quotes. Shorter, rating-based client
// reviews live in the `reviews` table (lib/reviews-store.ts) and are
// moderated from /dashboard/admin/reviews.
// ---------------------------------------------------------------------------

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "We went from a whiteboard and a stack of paper job cards to a dispatch board the whole team can see. The office used to phone each technician four times a day — now the jobs just arrive on their phones. It changed how the business runs, not just how it looks.",
    author: "Thulani Ndlovu",
    role: "Owner",
    company: "Ndlovu Plumbing & Sons",
  },
  {
    quote:
      "Every vehicle in our fleet has a service history, a next-due date, and a reminder that actually fires. License renewals used to sneak up on us; they don't anymore. MotionGrid understood maintenance operations better than agencies twice their size.",
    author: "Alicia Fourie",
    role: "Fleet Manager",
    company: "Vantage Fleet Services",
  },
  {
    quote:
      "A customer walks in with a dented bumper, and we hand them a branded PDF estimate before they've finished their coffee. Parts, labour, VAT — all pulled from our own rate card. That single tool paid for the whole project.",
    author: "Sipho Khumalo",
    role: "Workshop Manager",
    company: "Khumalo Panel & Paint",
  },
  {
    quote:
      "What I appreciated most: they told us what NOT to build in version one. We launched with one thing that worked, and grew into the rest. Eight months in, the platform runs our bookings, our invoices, and our follow-ups.",
    author: "Naledi Mthembu",
    role: "Operations Lead",
    company: "QuickFix Maintenance Group",
  },
  {
    quote:
      "Straight talk, clear timelines, no surprises on the invoice. The booking portal they built took phone tag with customers down to almost nothing. Our receptionist asks me when they're building the next one.",
    author: "Rian van der Merwe",
    role: "Director",
    company: "Cape Aqua Plumbing",
  },
  {
    quote:
      "We had a quoting process held together by three spreadsheets and one person's memory. MotionGrid replaced it with something our new staff can learn in an afternoon. That was the real win — it survived the person who built the spreadsheets leaving.",
    author: "Priya Naidoo",
    role: "Financial Director",
    company: "Steel Route Logistics",
  },
];
