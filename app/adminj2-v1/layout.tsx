import type { Metadata } from "next";
import { AdminSidebar } from "@/components/nav/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s — Admin · MotionGrid` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex min-h-screen w-full overflow-hidden bg-black">
      <AdminSidebar />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
