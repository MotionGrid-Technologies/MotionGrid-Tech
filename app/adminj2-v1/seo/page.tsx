import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyCard } from "@/components/ui/Card";

export const metadata = { title: "SEO" };

export default function SeoPage() {
  return (
    <section className="py-16 md:py-24">
      <Container className="flex flex-col gap-16">
        <header className="flex flex-col gap-4">
          <Eyebrow>Admin</Eyebrow>
          <h1 className="font-display text-4xl text-chrome-100 md:text-5xl">SEO</h1>
          <p className="max-w-xl text-sm leading-relaxed text-chrome-500">
            Manage metadata, sitemap, robots, and per-page search optimisation.
          </p>
        </header>

        <EmptyCard
          label="Coming soon"
          note="SEO controls — meta titles/descriptions, OG tags, sitemap overrides, and indexing toggles — will live here."
        />
      </Container>
    </section>
  );
}