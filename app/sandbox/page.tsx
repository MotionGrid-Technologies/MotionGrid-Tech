import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { CodePlayground } from "@/components/sections/CodePlayground";

export const metadata: Metadata = {
  title: "Live Sandbox",
  description: "An interactive space to try MotionGrid's work directly in the browser.",
};

export default function SandboxPage() {
  return (
    <>
      <PageHero
        eyebrow="Live sandbox"
        title="Try it, don't just read about it."
        lede="A running space where you can interact with a piece of MotionGrid's
        work directly — no sales call required."
      />

      <section className="py-24 md:py-28">
        <Container>
          <CodePlayground />
        </Container>
      </section>
    </>
  );
}