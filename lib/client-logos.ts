// ---------------------------------------------------------------------------
// Client logos for the marquee on /testimonials.
//
// Rendered as typeset wordmarks (no image assets) — each entry styles the
// company name in the display font, echoing the brushed-chrome brand.
// Replace with real logo SVGs as they become available.
// ---------------------------------------------------------------------------

export interface ClientLogo {
  name: string;
  industry: string;
}

export const clientLogos: ClientLogo[] = [
  { name: "Ndlovu Plumbing & Sons", industry: "Plumbing" },
  { name: "Vantage Fleet Services", industry: "Fleet Maintenance" },
  { name: "Khumalo Panel & Paint", industry: "Panel Beating" },
  { name: "Cape Aqua Plumbing", industry: "Plumbing" },
  { name: "QuickFix Maintenance Group", industry: "Field Service" },
  { name: "Steel Route Logistics", industry: "Logistics" },
  { name: "AutoCare Panel Workshops", industry: "Panel Beating" },
  { name: "Highveld Water Works", industry: "Plumbing" },
  { name: "TransKaap Freight", industry: "Fleet Maintenance" },
  { name: "Precision Auto Body", industry: "Panel Beating" },
];
