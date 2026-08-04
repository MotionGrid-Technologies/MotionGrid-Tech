import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with MotionGrid Technologies or book a demo.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}