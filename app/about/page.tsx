import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { ContactLine } from "@/components/ui/ContactLine";
import { PageHero } from "@/components/sections/PageHero";
import { FilamentDivider } from "@/components/motifs/FilamentDivider";
import { founders } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "MotionGrid Technologies is built by two engineers who care about precision, longevity, and software that actually holds up in the field.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About MotionGrid"
        title="Two engineers, one standard."
        lede="MotionGrid Technologies was founded on a simple belief: 
        the software powering real operations deserves the same engineering discipline 
        as the machinery and systems it supports"
      />

      <section className="py-24 md:py-28">
        <Container className="flex flex-col gap-16">
          <SectionHeading
            eyebrow="The founders"
            title="The minds behind the machinery."
            lede="MotionGrid Technologies was founded by Mnqobi Ntuli and Prince Ncube,
             two software developers brought together by a shared passion for solving real-world problems through technology. 
             What began with university projects and countless hours of learning evolved into a partnership built on trust, curiosity, and a commitment to delivering software that makes a measurable difference.
             As computer scientist Alan Kay famously said, 'The best way to predict the future is to invent it.' That philosophy continues to shape how we approach every project—embracing new technologies,
              refining our craft, and building solutions that move businesses forward. At MotionGrid, we believe great software isn't created by knowing everything; it's created by never stopping the pursuit of learning."
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {founders.map((f) => (
              <Card key={f.name} className="flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  {f.photo ? (
                    <Image
                      src={f.photo}
                      alt={f.name}
                      width={112}
                      height={112}
                      className="h-28 w-28 shrink-0 rounded-full object-cover ring-1 ring-hairline"
                    />
                  ) : (
                    
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-hairline bg-obsidian font-display text-2xl text-chrome-300">
                      {f.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-2xl text-chrome-100">{f.name}</h3>
                    <p className="mg-eyebrow mt-1.5">{f.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-chrome-500">{f.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {f.focus.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-hairline px-3 py-1 text-xs text-chrome-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Direct line for this founder — one phone number per founder */}
                <ContactLine phone={f.phone} email={f.email} />
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <FilamentDivider className="mx-auto max-w-[1400px]" />

      <section className="py-24 md:py-28">
        <Container className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <SectionHeading
            eyebrow="How we work"
            title="Built with purpose."
            lede="Our philosophy is simple: build software that solves real problems without compromising on quality."
          />
          <div className="flex flex-col gap-6 text-chrome-500">
            <p className="leading-relaxed">
              We don't believe in building software for the sake of technology. We
    believe in understanding how a business operates and engineering solutions
    that make that operation faster, simpler, and more reliable.
            </p>
            <p className="leading-relaxed">
              Throughout every project, we work transparently with our clients, sharing
    progress, discussing challenges openly, and refining solutions together.
    The result is software that's practical, reliable, and built to support
    your business long after launch.
             </p>
          </div>
        </Container>
      </section>
    </>
  );
}
