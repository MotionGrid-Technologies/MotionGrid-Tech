import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerColumns, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-obsidian-soft">
      <Container className="grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt={site.name} width={32} height={32} className="h-8 w-8" />
            <span className="font-display text-base text-chrome-100">MotionGrid</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-chrome-500">{site.tagline}</p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <span className="mg-eyebrow">{col.title}</span>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-chrome-500 transition-colors hover:text-chrome-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-hairline-soft py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-chrome-700 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>Designed &amp; engineered in-house.</span>
        </Container>
      </div>
    </footer>
  );
}
