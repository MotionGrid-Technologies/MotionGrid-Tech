import type { Metadata } from "next";
import { LegalDoc } from "@/components/sections/LegalDoc";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MotionGrid Technologies collects, uses, and protects personal data.",
};

// TODO: have this reviewed by a lawyer before publishing. Placeholders below
// (registration details, retention periods, sub-processors) need real values.
export default function PrivacyPolicyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Privacy Policy"
      updated="4 August 2026"
      intro="This policy explains what personal data MotionGrid Technologies collects, why, and how it's handled."
      sections={[
        {
          heading: "Who we are",
          paragraphs: [
            `MotionGrid Technologies ("MotionGrid Tech", "we", "us") builds software for businesses and their customers. This policy applies to data collected through ${site.url} and any product or service that links to it.`,
            "MotionGrid Technologies Pty(ltd) (2026/539173/07)   45 Sangiro Ave Elandspark 2197",
          ],
        },
        {
          heading: "Information we collect",
          list: [
            "Contact details you provide directly — name, email, phone number, company.",
            "Information submitted through forms, such as demo requests or enquiries.",
            "Any data you input into the Live Sandbox or Micro-Tools features while evaluating them.",
            "Usage data collected automatically, such as pages visited and general device/browser information.",
            "Any information you choose to share when contacting us directly.",
          ],
        },
        {
          heading: "How we use information",
          list: [
            "To respond to enquiries and demo requests.",
            "To operate, maintain, and improve this website and our products, including the Sandbox and Micro-Tools.",
            "To understand aggregate usage patterns (see Cookie Policy).",
            "To meet legal and contractual obligations.",
          ],
        },
        {
          heading: "Analytics",
          paragraphs: [
            "We use privacy-conscious analytics tooling (PostHog) to understand how the site is used in aggregate. See our Cookie Policy for details on what's collected and how to opt out.",
          ],
        },
        {
          heading: "Data storage",
          paragraphs: [
            "Some features of this site store data using infrastructure we operate directly. We take reasonable technical and organisational measures to protect this data against unauthorised access, loss, or misuse.",
            "TODO: confirm hosting provider(s) and where data is physically stored (relevant for cross-border transfer disclosures under POPIA).",
          ],
        },
        {
          heading: "Data sharing",
          paragraphs: [
            "We do not sell personal data. Information may be shared with service providers who help us operate the site and our products (for example, hosting or analytics providers), under agreements that require them to protect it.",
            "TODO: list specific sub-processors once finalised (known so far: PostHog for analytics; hosting provider TBC).",
          ],
        },
        {
          heading: "Data retention",
          paragraphs: [
            "We retain personal data only as long as needed for the purposes described in this policy, or as required by law.",
            "TODO: confirm specific retention periods (e.g. enquiry data retained for X months after last contact; sandbox/tool input data retained for X days).",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Depending on your location, you may have rights to access, correct, delete, or export your personal data, and to object to certain processing. If South African law (POPIA) applies to you, you also have the right to lodge a complaint with the Information Regulator.",
          ],
          list: [`To exercise these rights, contact us at ${site.email}.`],
        },
        {
          heading: "Children's privacy",
          paragraphs: [
            "This site is not directed at children, and we do not knowingly collect personal information from children.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: [
            "We may update this policy from time to time. The \"last updated\" date above reflects the most recent revision.",
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