import type { Metadata } from "next";
import { LegalDoc } from "@/components/sections/LegalDoc";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of MotionGrid Technologies' website and products.",
};

// TODO: have this reviewed by a lawyer before publishing.
export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Terms of Service"
      updated="4 August 2026"
      intro="These terms govern your use of this website. Separate agreements govern any specific product or client engagement."
      sections={[
        {
          heading: "Acceptance of terms",
          paragraphs: [
            "By accessing or using this website, you agree to these Terms of Service. If you do not agree, please do not use the site.",
          ],
        },
        {
          heading: "Use of the site",
          list: [
            "You may not use the site in any way that violates applicable law.",
            "You may not attempt to interfere with the security or functionality of the site.",
            "You may not attempt to gain unauthorised access to any part of the site, its underlying systems, or data stored by it.",
            "Content on this site is for general information and does not constitute a binding offer unless stated otherwise.",
          ],
        },
        {
          heading: "Sandbox and tools",
          paragraphs: [
            "Features such as the Live Sandbox and Micro-Tools are provided for demonstration and evaluation purposes. They are provided \"as is\" and may change, be interrupted, or be discontinued at any time without notice.",
            "You must not upload, submit, or process any data through these features that you do not have the right to share, or that is confidential, sensitive, or unlawful.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "All content on this site — including text, design, logos, and code — is the property of MotionGrid Technologies unless otherwise noted, and may not be reproduced without permission.",
          ],
        },
        {
          heading: "Client engagements",
          paragraphs: [
            "Work performed for clients (including case studies referenced on this site) is governed by separate signed agreements, not by these terms.",
          ],
        },
        {
          heading: "Disclaimers",
          paragraphs: [
            "This site and its content, including any sandbox or tools features, are provided \"as is\" and \"as available\" without warranties of any kind, whether express or implied, to the extent permitted by law.",
          ],
        },
        {
          heading: "Limitation of liability",
          paragraphs: [
            "To the fullest extent permitted by applicable law, MotionGrid Technologies shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, this site. Our total liability for any claim arising from your use of this site shall not exceed an amount reasonable in the circumstances.",
            "TODO: confirm this clause with a lawyer, particularly around any liability that cannot legally be limited under South African consumer protection law (e.g. the Consumer Protection Act, if it applies to your relationship with site visitors).",
          ],
        },
        {
          heading: "Indemnity",
          paragraphs: [
            "You agree to indemnify MotionGrid Technologies against any claims, losses, or damages arising from your misuse of the site or breach of these terms.",
          ],
        },
        {
          heading: "Changes to these terms",
          paragraphs: [
            "We may update these terms from time to time. The \"last updated\" date above reflects the most recent revision. Continued use of the site after changes constitutes acceptance of the revised terms.",
          ],
        },
        {
          heading: "Governing law",
          paragraphs: [
            "These terms are governed by the laws of the Republic of South Africa. TODO: confirm this is the correct jurisdiction, and specify a forum (e.g. courts of a particular province) if desired.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [`Questions about these terms can be sent to ${site.email}.`],
        },
      ]}
    />
  );
}