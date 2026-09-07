import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center py-16 md:py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-sm tracking-[0.3em] text-signal uppercase">
          404
        </p>
        <h1 className="max-w-2xl font-display text-4xl text-chrome-100 md:text-6xl">
          This page went off the grid
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-chrome-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <Button href="/" variant="primary">
          Back to homepage
        </Button>
      </Container>
    </section>
  );
}
