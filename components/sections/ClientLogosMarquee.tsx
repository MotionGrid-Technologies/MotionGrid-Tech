import type { ClientLogo } from "@/lib/client-logos";

// Duplicated track = seamless -50% translate loop (see .mg-marquee-track in
// globals.css). Animation is disabled under prefers-reduced-motion, where the
// mask widens so every logo is readable in the static row.
export function ClientLogosMarquee({ logos }: { logos: ClientLogo[] }) {
  if (logos.length === 0) return null;

  const track = [...logos, ...logos];

  return (
    <section
      aria-label="Clients we work with"
      className="overflow-hidden border-y border-hairline bg-obsidian-soft py-10"
    >
      <div className="mg-marquee-mask">
        <div className="mg-marquee-track flex w-max items-center gap-12 px-6">
          {track.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex shrink-0 flex-col items-center gap-1.5 md:flex-row md:gap-3"
            >
              <span className="font-display text-lg tracking-wide text-chrome-500">
                {logo.name}
              </span>
              <span className="mg-eyebrow text-chrome-700">{logo.industry}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
