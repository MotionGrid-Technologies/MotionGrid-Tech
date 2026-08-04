import type { Metadata } from "next";
import { LegalDoc } from "@/components/sections/LegalDoc";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How MotionGrid Technologies uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Cookie Policy"
      updated="4 August 2026"
      intro="This explains the cookies and similar technologies used on this site, and how to control them."
      sections={[
        {
          heading: "What cookies are",
          paragraphs: [
            "Cookies are small text files placed on your device to help websites function and to collect usage information. We may also use similar technologies, such as local storage, for the same purposes.",
          ],
        },
        {
          heading: "Cookies we use",
          list: [
            "Essential cookies — required for core site functionality (e.g. remembering cookie preferences and basic session state).",
            "Analytics cookies — PostHog, used to understand aggregate site usage such as pages viewed, general navigation patterns, and interaction with features like the Live Sandbox and Micro-Tools. TODO: confirm final analytics configuration and retention.",
          ],
        },
        {
          heading: "Why we use them",
          paragraphs: [
            "We use cookies to keep the site working properly and to understand, in aggregate, how visitors use it — which helps us improve navigation, content, and the tools we offer. We do not use cookies for third-party advertising.",
          ],
        },
        {
          heading: "Managing cookies",
          paragraphs: [
            "Most browsers let you refuse, block, or delete cookies through their settings, and many offer a way to do this on a per-site basis. Blocking essential cookies may affect site functionality, such as remembering your preferences.",
            "TODO: if a cookie consent banner or preference centre is added to the site, link or describe it here.",
          ],
        },
        {
          heading: "Third parties",
          paragraphs: [
            "Analytics cookies are set by PostHog on our behalf. PostHog may process this data in accordance with its own privacy practices. We do not permit third parties to set advertising or tracking cookies through this site.",
            "TODO: confirm PostHog hosting region/instance (self-hosted vs. PostHog Cloud) for accuracy here and in the Privacy Policy's cross-border transfer disclosures.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: [
            "We may update this policy as our use of cookies changes. The \"last updated\" date above reflects the most recent revision. Check back periodically for updates.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [`Questions about this policy can be sent to ${site.email}.`],
        },
      ]}
    />
  );
}