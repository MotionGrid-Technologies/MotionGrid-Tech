import type { Metadata } from "next";
import { LegalDoc } from "@/components/sections/LegalDoc";
import { site } from "@/lib/site";
import { buildPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/legal/privacy", {
    title: "Privacy Policy",
    description: "How MotionGrid Technologies collects, uses, and protects personal data.",
  });
}

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
          heading: "Consent",
          paragraphs: [
            "Before submitting an enquiry or demo request through our contact forms, we ask you to confirm your consent to us processing the details you provide for the purpose of responding to your enquiry. This consent is recorded against your submission.",
            "You may withdraw your consent at any time by contacting us using the details below. Withdrawal does not affect the lawfulness of processing that happened before the withdrawal.",
          ],
        },
        {
          heading: "Cookies and analytics consent",
          paragraphs: [
            "We use cookies and similar technologies, including privacy-conscious analytics (PostHog), as described in our Cookie Policy. You can choose whether to allow analytics cookies via the cookie banner, and you can change your choice at any time by clearing your browser cookies for this site.",
          ],
        },
        {
          heading: "Data storage",
          paragraphs: [
            "Some features of this site store data using infrastructure we operate directly. We take reasonable technical and organisational measures to protect this data against unauthorised access, loss, or misuse.",
          ],
        },
        {
          heading: "Data sharing",
          paragraphs: [
            "We do not sell personal data. Information may be shared with service providers who help us operate the site and our products (for example, hosting or analytics providers), under agreements that require them to protect it.",
            "Known service providers include PostHog for analytics and Resend for email delivery.",
          ],
        },
        {
          heading: "Data retention",
          paragraphs: [
            "We retain personal data only as long as needed for the purposes described in this policy, or as required by law.",
            "As a practical guideline, enquiry records are retained for up to 24 months after your last contact, and Live Sandbox or Micro-Tools input data for up to 30 days. These periods may be shorter where the purpose for processing no longer applies.",
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