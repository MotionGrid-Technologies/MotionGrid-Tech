import { redirect } from "next/navigation";
import { SuperAdminThemeProvider } from "@/components/providers/SuperAdminThemeProvider";
import { createSupabaseServerClient, getRoleFromJWT } from "@/lib/supabaseServer";

export default async function AutofieldAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || getRoleFromJWT(session) !== "super_admin") {
    redirect("/login");
  }

  return (
    <SuperAdminThemeProvider
      user={{
        id: session.user.id,
        email: session.user.email,
        role: getRoleFromJWT(session),
      }}
    >
      {children}
    </SuperAdminThemeProvider>
  );
}
