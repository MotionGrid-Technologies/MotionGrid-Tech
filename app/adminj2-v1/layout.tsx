import type { Metadata } from "next";
import { AdminSidebar } from "@/components/nav/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s — Admin · MotionGrid` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}