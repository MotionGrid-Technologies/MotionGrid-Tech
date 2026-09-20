// Frequently asked questions. Single source of truth for both the visible
// accordion (app/faq/page.tsx) and the injected FAQPage JSON-LD schema so the
// two can never drift apart.
export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "What kinds of businesses do you work with?",
    answer:
      "Field service and workshop operations, logistics, healthcare, retail, and industrial businesses — plus any company weighed down by repetitive manual workflows. We focus on operations that run on real machinery, real schedules, and real paperwork, and we build software that fits how they actually work.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "It depends on scope. A focused MVP can ship in 4–8 weeks, while larger platforms typically run 3–6 months. Before we start, you get a clear timeline and a milestone plan so there are no surprises along the way.",
  },
  {
    question: "Do you integrate with existing systems or only build from scratch?",
    answer:
      "Both. We regularly integrate with the tools you already run — CRMs, accounting, inventory, and third-party APIs — and we build greenfield when that is genuinely the better path. We will recommend whichever serves the operation best, even if that means building less.",
  },
  {
    question: "How do you price your work?",
    answer:
      "Project-based pricing agreed up front, with a transparent scope and milestone breakdown. No hourly billing surprises and no vendor lock-in — you own the code and the platform we build for you.",
  },
];