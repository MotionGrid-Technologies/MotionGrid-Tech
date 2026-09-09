"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { signOut } from "@/app/login/actions";

export function Navbar({ user }: { user?: SupabaseUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus management: when the menu opens, move focus inside and trap it;
  // close on Escape; when it closes, restore focus to the trigger.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          return;
        }
        if (e.key !== "Tab") return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !panel.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
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

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-graphite/40 text-chrome-100 transition-colors hover:border-chrome-500 hover:text-chrome-100"
                  aria-label="Go to dashboard"
                  title="Dashboard"
                >
                  <User size={18} />
                </Link>
                <form action={signOut}>
                  <Button type="submit" variant="ghost">
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <Button href="/login" variant="ghost">
                Sign In
              </Button>
            )}
            <Button href="/contact#demo" variant="primary">
              Book a free demo
            </Button>
          </div>

          <button
            ref={triggerRef}
            className="text-chrome-100 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-dialog"
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
        ref={panelRef}
        id="mobile-nav-dialog"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(80vw,320px)] flex-col border-l border-hairline bg-obsidian-soft shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        inert={!open}
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
            ref={closeRef}
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
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Button
                  href="/dashboard"
                  variant="chrome"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Button>
                <form action={signOut}>
                  <Button type="submit" variant="ghost" className="w-full">
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <Button
                href="/login"
                variant="chrome"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Button>
            )}
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
      </div>
    </>
  );
}
