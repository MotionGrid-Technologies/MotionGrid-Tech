import type { Metadata } from "next";
import { ShieldCheck, Lock, KeyRound, ServerCog } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security & Trust",
  description: "How MotionGrid Technologies approaches security across its products and infrastructure.",
};

const pillars = [
  {
    icon: Lock,
    title: "Encryption in transit",
    copy: "All traffic to this site and our products is served over HTTPS.",
  },
  {
    icon: KeyRound,
    title: "Access control",
    copy: "Access to client systems and data is limited to the people who need it, on a per-engagement basis.",
  },
  {
    icon: ServerCog,
    title: "Secure infrastructure",
    copy: "Production systems run on reputable, well-maintained cloud infrastructure with regular updates.",
    // TODO: name actual hosting/infrastructure providers once finalised
  },
  {
    icon: ShieldCheck,
    title: "Responsible development",
    copy: "Typed languages, code review, and testing are standard practice across every engagement.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security & Trust"
        title="Security isn't a bolt-on."
        lede="Precision engineering means treating security as part of the build,
        not an afterthought. Here's how we approach it."
      />

      <section className="py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <SectionHeading eyebrow="Our approach" title="How we handle security today." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, copy }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-8"
              >
                <Icon size={20} className="text-signal" strokeWidth={1.5} />
                <h3 className="font-display text-lg text-chrome-100">{title}</h3>
                <p className="text-sm leading-relaxed text-chrome-500">{copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-24 md:py-28">
        <Container className="flex flex-col gap-6">
          <SectionHeading eyebrow="Disclosure" title="Found a security issue?" />
          <p className="max-w-xl leading-relaxed text-chrome-500">
            If you believe you&apos;ve found a security vulnerability affecting
            MotionGrid Technologies or its products, please report it to us
            directly rather than disclosing it publicly. We&apos;ll acknowledge
            reports and work with you on a resolution.
          </p>
          {/* TODO: consider a dedicated security@ inbox once volume warrants it */}
          <a
            href={`mailto:${site.email}`}
            className="text-sm text-signal underline underline-offset-4"
          >
            {site.email}
          </a>
        </Container>
      </section>
    </>
  );
}
