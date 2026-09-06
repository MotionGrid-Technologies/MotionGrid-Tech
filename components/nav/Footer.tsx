import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerColumns, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-obsidian-soft">
      <Container className="grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2 flex flex-col items-center gap-5 md:items-start">
          <Image
            src="/brand/logo-stacked.svg"
            alt={site.name}
            width={262}
            height={242}
            className="h-28 w-auto"
          />
          <p className="max-w-xs text-center text-sm leading-relaxed text-chrome-500 md:text-left">{site.tagline}</p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title} className="flex flex-col items-center gap-3 md:items-start">
            <span className="mg-eyebrow">{col.title}</span>
            <ul className="flex flex-col items-center gap-2.5 md:items-start">
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
