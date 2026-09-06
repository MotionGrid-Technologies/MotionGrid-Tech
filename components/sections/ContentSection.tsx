import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

type ContentSectionProps = {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  cta?: { label: string; href: string };
  className?: string;
  variant?: "default" | "muted";
};

export function ContentSection({
  eyebrow,
  title,
  lede,
  children,
  cta,
  className,
  variant = "default",
}: ContentSectionProps) {
  return (
    <section
      className={cn(
        "py-24 md:py-32",
        variant === "muted" && "border-t border-hairline bg-graphite/30",
        className
      )}
    >
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow={eyebrow} title={title} lede={lede} />
        {children}
        {cta && (
          <Button href={cta.href} variant="ghost" className="self-start">
            {cta.label} <ArrowUpRight size={16} />
          </Button>
        )}
      </Container>
    </section>
  );
}
