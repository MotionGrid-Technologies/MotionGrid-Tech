import type { Testimonial } from "@/lib/testimonials";
import { Card } from "@/components/ui/Card";

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => (
        <Card as="article" key={`${t.author}-${t.company}`} className="flex h-full flex-col gap-6">
          <span className="font-display text-4xl italic leading-none text-signal">&ldquo;</span>
          <blockquote className="text-sm leading-relaxed text-chrome-300">{t.quote}</blockquote>
          <div className="mt-auto border-t border-hairline pt-4">
            <p className="text-sm font-medium text-chrome-100">{t.author}</p>
            <p className="mt-0.5 text-xs text-chrome-500">
              {t.role} · {t.company}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
