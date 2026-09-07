import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/nav/AdminSidebar";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s — Admin · MotionGrid` },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="fixed inset-0 z-40 flex min-h-screen w-full overflow-hidden bg-black">
      <AdminSidebar />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
