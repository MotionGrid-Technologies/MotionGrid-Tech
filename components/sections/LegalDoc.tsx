import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export function LegalDoc({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <section className="mg-brushed border-b border-hairline">
        <Container className="flex flex-col gap-6 py-20 md:py-24">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="max-w-2xl font-display text-[2.25rem] italic leading-[1.1] text-chrome-100 md:text-[2.75rem]">
            {title}
          </h1>
          <p className="text-sm text-chrome-700">Last updated: {updated}</p>
          {intro && <p className="max-w-2xl leading-relaxed text-chrome-500">{intro}</p>}
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[240px_1fr]">
          <nav className="hidden flex-col gap-3 lg:flex">
            <span className="mg-eyebrow">On this page</span>
            <ul className="flex flex-col gap-2.5">
              {sections.map((s, idx) => (
                <li key={s.heading}>
                  <a
                    href={`#${slugify(s.heading)}`}
                    className="text-sm text-chrome-500 hover:text-chrome-200"
                  >
                    {String(idx + 1).padStart(2, "0")}. {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-14">
            {sections.map((s) => (
              <div key={s.heading} id={slugify(s.heading)} className="scroll-mt-24">
                <h2 className="font-display text-xl text-chrome-100">{s.heading}</h2>
                <div className="mt-4 flex flex-col gap-4">
                  {s.paragraphs?.map((p, i) => (
                    <p key={i} className="leading-relaxed text-chrome-500">
                      {p}
                    </p>
                  ))}
                  {s.list && (
                    <ul className="flex flex-col gap-2 pl-5 text-chrome-500">
                      {s.list.map((item, i) => (
                        <li key={i} className="list-disc leading-relaxed marker:text-signal">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
