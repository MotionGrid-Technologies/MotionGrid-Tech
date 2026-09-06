import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AnimatedFilament } from "@/components/motifs/AnimatedFilament";

type HeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  cta: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
  showFilament?: boolean;
};

export function Hero({ eyebrow, title, description, cta, showFilament = true }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-hairline mg-brushed">
      {showFilament && (
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <AnimatedFilament />
        </div>
      )}
      <Container className="relative flex min-h-[86vh] flex-col justify-center gap-8 py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-3xl font-display text-[2.75rem] italic leading-[1.05] tracking-[-0.01em] text-chrome-100 sm:text-[3.5rem] md:text-[4.5rem]">
          {title}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-chrome-500">
          {description}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href={cta.primary.href} variant="primary">
            {cta.primary.label}
          </Button>
          {cta.secondary && (
            <Button href={cta.secondary.href} variant="chrome">
              {cta.secondary.label}
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
