import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyCard } from "@/components/ui/Card";

export const metadata = { title: "Autofield" };

export default function AutofieldPage() {
  return (
    <section className="py-16 md:py-24">
      <Container className="flex flex-col gap-16">
        <header className="flex flex-col gap-4">
          <Eyebrow>Admin</Eyebrow>
          <h1 className="font-display text-4xl text-chrome-100 md:text-5xl">Autofield</h1>
          <p className="max-w-xl text-sm leading-relaxed text-chrome-500">
            Automated field workflows — scheduling, dispatch, and follow-ups.
          </p>
        </header>

        <EmptyCard
          label="Coming soon"
          note="Autofield rules, schedules, and run history will live here."
        />
      </Container>
    </section>
  );
}