import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyCard } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Products",
  description: "In-house tools built and maintained by MotionGrid Technologies.",
};

// TODO: fill in each product as it's ready. name/status/summary are the
// minimum — description, screenshots, and links can be added per product.
const products: {
  name: string;
  status: "active" | "soon";
  summary: string;
  image?: { src: string; width: number; height: number; alt: string };
}[] = [
  {
    name: "AutoField",
    status: "active",
    summary: "This is a website for workshops where they can create quotes and invoices and keep track of leads and jobs all from one central software", // TODO: one-line summary of what AutoField does
    image: {
      src: "/autofield-pics/autofield.png",
      width: 1313,
      height: 823,
      alt: "AutoField",
    },
  },
  {
    name: "Reserved slot",
    status: "soon",
    summary: "",
  },
];

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
                <StatusPill status={p.status} />
              </div>
              {p.summary ? (
                <p className="text-sm leading-relaxed text-chrome-500">{p.summary}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* TODO: replace placeholder lines with real product copy */}
                  <div className="h-3 w-full rounded-full bg-graphite-high" />
                  <div className="h-3 w-2/3 rounded-full bg-graphite-high" />
                </div>
              )}
              <div className="flex h-32 items-center justify-center rounded-[var(--radius-mg)] border border-dashed border-hairline">
                {p.image ? (
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    width={p.image.width}
                    height={p.image.height}
                    className="h-auto w-auto max-h-full max-w-full object-contain"
                  />
                ) : null}
              </div>
            </div>
          ))}

          <EmptyCard
            label="Next product slot"
            note="Reserved for the next in-house tool we ship."
            className="md:col-span-2"
          />
        </Container>
      </section>
    </>
  );
}
