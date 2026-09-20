import type { Metadata } from "next";
import { LegalDoc } from "@/components/sections/LegalDoc";
import { site } from "@/lib/site";
import { buildPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/legal/terms", {
    title: "Terms of Service",
    description: "Terms governing use of MotionGrid Technologies' website and products.",
  });
}

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
          heading: "Your representations",
          paragraphs: [
            "By using this site or submitting any form, you confirm that the information you provide is accurate and yours to share, and that you have read and agree to our Privacy Policy, including the processing and consent practices described there.",
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
            "These terms are governed by the laws of the Republic of South Africa.",
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