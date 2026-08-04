import Link from "next/link";

export function TechCategoryCard({
  href,
  title,
  description,
  count,
}: {
  href: string;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-10 transition-colors hover:border-chrome-700"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl text-chrome-100">{title}</span>
        <span className="text-chrome-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
          ↗
        </span>
      </div>
      <p className="text-sm leading-relaxed text-chrome-500">{description}</p>
      <span className="mg-eyebrow mt-2">{count} technologies</span>
    </Link>
  );
}