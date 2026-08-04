import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
}) {
  return (
    <section className="mg-brushed border-b border-hairline">
      <Container className="flex flex-col gap-6 py-20 md:py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-2xl font-display text-[2.5rem] italic leading-[1.08] tracking-[-0.01em] text-chrome-100 md:text-[3.25rem]">
          {title}
        </h1>
        {lede && <p className="max-w-xl text-lg leading-relaxed text-chrome-500">{lede}</p>}
      </Container>
    </section>
  );
}
