import type { Metadata } from "next";
import { LegalDoc } from "@/components/sections/LegalDoc";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "MotionGrid Technologies' commitment to an accessible website.",
};

export default function AccessibilityPage() {
  return (
    <LegalDoc
      eyebrow="Trust"
      title="Accessibility Statement"
      updated="[TODO: date]"
      intro="We want this site to be usable by as many people as possible, regardless of ability or technology."
      sections={[
        {
          heading: "Our commitment",
          paragraphs: [
            "MotionGrid Technologies aims to meet WCAG 2.1 AA standards across this website, and to keep improving as the site evolves.",
          ],
        },
        {
          heading: "What we've built in",
          list: [
            "Visible keyboard focus states throughout the site.",
            "Semantic HTML structure for headings, navigation, and landmarks.",
            "Colour contrast checked against the dark, chrome-on-obsidian palette.",
            "Reduced-motion preferences are respected for animated elements.",
            "Responsive layout that works across screen sizes and zoom levels.",
          ],
        },
        {
          heading: "Known limitations",
          paragraphs: [
            "Accessibility is an ongoing process, not a one-time checklist. TODO: list any known gaps as they're identified through testing or feedback.",
          ],
        },
        {
          heading: "Feedback",
          paragraphs: [
            `If you encounter an accessibility barrier anywhere on this site, please let us know at ${site.email} — we'll do our best to address it.`,
          ],
        },
      ]}
    />
  );
}
