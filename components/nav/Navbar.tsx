"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-obsidian/85 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="-ml-1 flex items-center gap-3 md:-ml-2"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/logo.png"
            alt={site.name}
            width={48}
            height={48}
            className="h-12 w-12"
            priority
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl tracking-tight text-chrome-100 md:text-2xl">
              MotionGrid
              <sup className="ml-0.5 align-super text-base text-signal md:text-lg">●</sup>
            </span>
            <span className="mg-eyebrow mt-1 w-full text-center text-[0.5rem] tracking-[0.42em] text-chrome-500">
              Technologies
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  active ? "text-chrome-100" : "text-chrome-500 hover:text-chrome-200"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/contact#demo" variant="primary">
            Book a demo
          </Button>
        </div>

        <button
          className="text-chrome-100 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-hairline bg-obsidian lg:hidden">
          <Container className="flex flex-col gap-1 py-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-mg)] px-3 py-3 text-base text-chrome-300 hover:bg-graphite hover:text-chrome-100"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/contact#demo" variant="primary" className="mt-3 w-full">
              Book a demo
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
