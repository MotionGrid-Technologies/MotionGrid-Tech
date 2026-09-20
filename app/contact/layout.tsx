import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/contact", {
    title: "Contact",
    description: "Get in touch with MotionGrid Technologies or book a demo.",
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}