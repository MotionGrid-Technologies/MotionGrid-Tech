// ---------------------------------------------------------------------------
// Central site configuration. Replace placeholder copy/data with the real
// thing as it becomes available — this file is the single source of truth
// consumed across layout, nav, footer, and metadata.
// ---------------------------------------------------------------------------

export const site = {
  name: "MotionGrid Technologies",
  shortName: "MotionGrid Tech",
  tagline: "Where we build tomorrow's software today.",
  description:
    "MotionGrid Technologies designs and builds bespoke software, from client platforms to in-house tools, engineered for precision, performance, and longevity.",
  url: "https://motiongrid.tech", 
  email: "motiongridt@gmail.com", 
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Technology", href: "/technology" },
  { label: "Industries", href: "/industries" },
  { label: "Contact", href: "/contact" },
];

export const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Book a Demo", href: "/contact#demo" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Products", href: "/products" },
      { label: "Industries", href: "/industries" },
      { label: "Technology", href: "/technology" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Live Sandbox", href: "/sandbox" },
      { label: "Micro-Tools", href: "/tools" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { label: "Security & Trust", href: "/security" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];


export const founders = [
  {
    name: "Prince Ncube", 
    role: "Co-Founder & Engineering Lead", 
    bio: "A Technology professional with experience in machine learning, data analysis, cybersecurity, and full-stack development. In addition to software engineering, I specialize in social media management and content creation, with a demonstrated track record of growing and managing audiences across multiple digital platforms.",
    phone: "+27 62 711 3769", 
    email: "princenube74@gmail.com", 
    photo: "/team/founder-1.png", 
    focus: ["Systems architecture", "Backend & infrastructure"],
  },
  {
    name: "Mnqobi Ntuli", 
    role: "Co-Founder & Product Lead", 
    bio: "A Software developer with a passion for building digital solutions. Experienced in modern web technologies, backend systems, databases, cloud platforms, and machine learning, I take products from concept to deployment. I also play a key role in client acquisition, communicating technical solutions in ways businesses understand, and manage stakeholder relationships from first conversation through delivery.",// Todo  need better bio
    phone: "+27 75 111 8856", 
    email: "Mnqobibog@gmail.com", 
    photo: "/team/founder-2.png", 
    focus: ["Product & interface design", "Client delivery"],
  },
];

export const industries = [
  {
    slug: "plumbing",
    name: "Plumbing",
    description:
      "Field service and dispatch tooling built for plumbing contractors — job scheduling, quoting, and technician workflows.",
    status: "active" as const,
  },
  {
    slug: "fleet-maintenance",
    name: "Fleet Maintenance",
    description:
      "Maintenance scheduling, inspection logs, and vehicle-lifecycle tracking for fleet operators.",
    status: "active" as const,
  },
  {
    slug: "panel-beating",
    name: "Panel Beating",
    description:
      "Estimate-to-handover workflows for panel and body shops — job cards, parts, and progress tracking.",
    status: "active" as const,
  },
  {
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    description:
      "Applied AI features and automation layered into existing products — from document processing to predictive scheduling.",
    status: "active" as const,
  },
  {
    slug: "logistics",
    name: "Logistics",
    description: "Route planning and delivery operations tooling.",
    status: "soon" as const,
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Practice and clinic workflow software.",
    status: "soon" as const,
  },
  {
    slug: "retail",
    name: "Retail",
    description: "Inventory, point-of-sale, and operations tooling.",
    status: "soon" as const,
  },
];
