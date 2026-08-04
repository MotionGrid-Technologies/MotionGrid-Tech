import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "font-display text-[2.25rem] leading-[1.08] tracking-[-0.01em] text-chrome-100 md:text-[3rem]",
          align === "center" && "mx-auto max-w-3xl"
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "max-w-xl text-[1.0625rem] leading-relaxed text-chrome-500",
            align === "center" && "mx-auto"
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
