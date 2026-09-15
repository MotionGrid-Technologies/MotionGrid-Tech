// ---------------------------------------------------------------------------
// Case studies for /case-studies. Realistic project write-ups across
// MotionGrid's active industries. Replace with verified client numbers as
// permission to publish is secured.
// ---------------------------------------------------------------------------

export interface CaseStudyResult {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  results: CaseStudyResult[];
  tags: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "ndlovu-plumbing-dispatch",
    title: "From paper job cards to live dispatch",
    client: "Ndlovu Plumbing & Sons",
    industry: "Plumbing",
    summary:
      "A six-van plumbing contractor replaces whiteboard dispatch with a live job board — cutting admin time and fitting more jobs into every day.",
    challenge:
      "Ndlovu Plumbing ran six vans across Johannesburg on paper job cards and a whiteboard. The office manager spent most of her morning phoning technicians to re-confirm addresses, re-write job details, and chase signed-off invoices. Jobs were lost when cards went missing, and end-of-month invoicing meant two full days of reconciling paper against memory.",
    solution:
      "MotionGrid built a dispatch board with drag-and-drop job assignment, customer address capture, and mobile job cards that work on a technician's phone — including offline capture in basements and ceiling voids. Signed-off jobs flow straight into a monthly invoice batch, so the office never re-keys anything. The whole system runs on one screen in the office and one app in the field.",
    results: [
      { value: "-70%", label: "Admin time on job allocation" },
      { value: "+3", label: "Extra jobs fitted per van, per week" },
      { value: "2 days → 2 hrs", label: "Monthly invoicing effort" },
      { value: "6 weeks", label: "From first workshop to handover" },
    ],
    tags: ["Field Service", "Dispatch", "Mobile", "Invoicing"],
  },
  {
    slug: "vantage-fleet-maintenance-tracker",
    title: "Fleet maintenance without the spreadsheet chaos",
    client: "Vantage Fleet Services",
    industry: "Fleet Maintenance",
    summary:
      "A 40-vehicle fleet operator trades three intertwined spreadsheets for per-vehicle service histories, automatic reminders, and a licence-renewal calendar.",
    challenge:
      "Vantage maintained 40 trucks and vans with service intervals tracked in a spreadsheet only one person fully understood. Licence and roadworthy renewals were caught by luck — twice a vehicle was flagged roadside for an expired disc. When the spreadsheet's owner went on leave, maintenance planning effectively stopped.",
    solution:
      "MotionGrid built a per-vehicle lifecycle tracker: every service, inspection, repair, and licence renewal lives against the vehicle, with automatic reminders at 30, 14, and 3 days before a due date. Workshop bookings are scheduled against the fleet calendar, and management sees a live compliance dashboard — any vehicle, any document, in two clicks.",
    results: [
      { value: "0", label: "Roadside compliance flags since launch" },
      { value: "100%", label: "Licence renewals actioned before due date" },
      { value: "-45%", label: "Unplanned downtime month-on-month" },
      { value: "40", label: "Vehicles under active tracking" },
    ],
    tags: ["Fleet", "Compliance", "Scheduling", "Dashboard"],
  },
  {
    slug: "khumalo-panel-quoting-engine",
    title: "Panel beating estimates in minutes, not afternoons",
    client: "Khumalo Panel & Paint",
    industry: "Panel Beating",
    summary:
      "A panel shop turns quote turnaround from an afternoon of parts phone-arounds into a counter-side estimate engine with branded PDF output.",
    challenge:
      "Every quote at Khumalo Panel & Paint meant phone calls to two parts suppliers, labour rates from a laminated sheet, and a hand-typed estimate. Turnaround was three to five hours — long enough that customers shopped elsewhere. Insurance-assisted quotes needed a second, different format entirely.",
    solution:
      "MotionGrid built a counter-side estimate engine: parts lookup against the shop's own supplier price history, labour rates by panel and severity, and VAT-ready totals. One click produces a branded PDF — in retail or insurance format — emailed to the customer before they leave the counter. Approved estimates convert into job cards with deposit tracking.",
    results: [
      { value: "3–5 hrs → 15 min", label: "Quote turnaround" },
      { value: "+31%", label: "Quotes converted to booked jobs" },
      { value: "2", label: "Quote formats from one estimate" },
      { value: "0", label: "Re-typed quotes since launch" },
    ],
    tags: ["Quoting", "PDF Generation", "Job Cards", "Workflow"],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}
