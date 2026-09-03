import Image from "next/image";

export function TechBadge({
  logo,
  name,
  category,
  description,
}: {
  logo: string;
  name: string;
  category: string;
  description?: string;
}) {
  return (
    <div className="group flex flex-col items-center gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-8 text-center transition-colors hover:border-chrome-700">
      <Image
        src={logo}
        alt={`${name} logo`}
        width={128}
        height={128}
        className="h-14 w-14 object-contain"
      />
      <div>
        <div className="font-display text-lg text-chrome-100">{name}</div>
        <div className="mg-eyebrow mt-1">{category}</div>
      </div>
      {description && <p className="text-sm leading-relaxed text-chrome-500">{description}</p>}
    </div>
  );
}
