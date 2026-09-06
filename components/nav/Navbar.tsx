"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline bg-obsidian/85 backdrop-blur-md">
        <Container className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className={cn("flex items-center", open && "invisible")}
            onClick={() => setOpen(false)}
          >
            <Image
              src="/brand/logo-horizontal.svg"
              alt={site.name}
              width={164}
              height={56}
              className="h-8 w-auto sm:h-10"
              priority
            />
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
              Book a free demo
            </Button>
          </div>

          <button
            className="text-chrome-100 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Menu size={24} />
          </button>
        </Container>
      </header>

      {/* Curtain backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-obsidian/80 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Curtain panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(80vw,320px)] flex-col border-l border-hairline bg-obsidian-soft shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-20 items-center justify-between border-b border-hairline px-6">
          <Image
            src="/brand/logo-horizontal.svg"
            alt={site.name}
            width={164}
            height={56}
            className="h-7 w-auto"
          />
          <button
            className="text-chrome-100"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-[var(--radius-mg)] px-4 py-3 text-base transition-colors",
                  active
                    ? "bg-graphite text-chrome-100"
                    : "text-chrome-300 hover:bg-graphite hover:text-chrome-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-hairline px-6 py-5">
          <Button
            href="/contact#demo"
            variant="primary"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Book a free demo
          </Button>
        </div>
      </div>
    </>
  );
}
