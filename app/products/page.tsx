import type { Metadata } from "next";
import Image from "next/image";
import { Hammer } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = {
  title: "Products",
  description: "In-house tools built and maintained by MotionGrid Technologies.",
};

const products: {
  name: string;
  status: "active" | "soon";
  summary: string;
  image?: { src: string; width: number; height: number; alt: string };
}[] = [
  {
    name: "AutoField",
    status: "active",
    summary:
      "Workshop management software for quoting, invoicing, and keeping track of leads and jobs in one place.",
    image: {
      src: "/autofield-pics/autofield.png",
      width: 1313,
      height: 823,
      alt: "AutoField workshop management dashboard",
    },
  },
];

/** Renders the product catalogue and product detail summaries. */
export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Tools we build for ourselves, then share."
        lede="Alongside client work, we build a small number of in-house products —
        software we use to run our own operations, refined enough to hand to
        others."
      />

      <section className="py-24 md:py-28">
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((p) => (
            <div
              key={p.name}
              className="flex flex-col gap-5 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-chrome-100">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm leading-relaxed text-chrome-500">{p.summary}</p>
              {p.image ? (
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-[var(--radius-mg)] border border-hairline bg-obsidian/60">
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    width={p.image.width}
                    height={p.image.height}
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-auto w-auto max-h-full max-w-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          ))}

          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[var(--radius-mg-lg)] border border-dashed border-hairline bg-transparent p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-graphite/60">
              <Hammer size={24} className="text-chrome-500" strokeWidth={1.5} />
            </span>
            <span className="mg-eyebrow text-chrome-700">Next product slot</span>
            <p className="max-w-xs text-sm text-chrome-700">
              Reserved for the next in-house tool we ship — in development now.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
