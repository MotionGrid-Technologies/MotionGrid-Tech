"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCookieConsent, setCookieConsent } from "@/lib/cookies";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (getCookieConsent() !== "undecided") return;
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleConsent = (status: "accepted" | "declined") => {
    setCookieConsent(status);
    setIsVisible(false);
    if (status === "accepted") {
      window.dispatchEvent(new Event("cookie_consent_updated"));
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mg-banner-in fixed bottom-6 left-6 right-6 z-50 md:left-auto md:max-w-md">
      <div className="rounded-2xl border border-hairline bg-obsidian/95 p-6 shadow-2xl backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-chrome-100 mb-2">Cookie Preferences</h3>
        <p className="text-sm text-chrome-300 mb-6 leading-relaxed">
          We use cookies to keep the site working and to understand, in aggregate, how it is
          used. Read our{" "}
          <Link href="/legal/cookies" className="text-signal hover:underline">
            Cookie Policy
          </Link>{" "}
          for more details.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" className="flex-1" onClick={() => handleConsent("accepted")}>
            Accept All
          </Button>
          <Button variant="chrome" className="flex-1" onClick={() => handleConsent("declined")}>
            Essential Only
          </Button>
        </div>
      </div>
    </div>
  );
}
