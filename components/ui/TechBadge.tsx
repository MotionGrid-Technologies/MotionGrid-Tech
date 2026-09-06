import Image from "next/image";
import { cn } from "@/lib/cn";

export function TechBadge({
  logo,
  name,
  category,
  description,
  className,
}: {
  logo: string;
  name: string;
  category: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex flex-col items-center gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-8 text-center transition-colors hover:border-chrome-700",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-obsidian transition-colors group-hover:border-signal/50">
        <Image
          src={logo}
          alt={`${name} logo`}
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
        />
      </div>
      <div>
        <div className="font-display text-lg text-chrome-100">{name}</div>
        <div className="mg-eyebrow mt-1">{category}</div>
      </div>
      {description && <p className="text-sm leading-relaxed text-chrome-500">{description}</p>}
    </div>
  );
}
