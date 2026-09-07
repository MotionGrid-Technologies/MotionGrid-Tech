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
    data: { user },
  } = await supabase.auth.getUser();
  const { data: claimsData } = await supabase.auth.getClaims();
  const role = getRoleFromJWT(claimsData?.claims);

  if (!user || role !== "super_admin") {
    redirect("/login");
  }

  return (
    <SuperAdminThemeProvider
      user={{
        id: user.id,
        email: user.email,
        role,
      }}
    >
      {children}
    </SuperAdminThemeProvider>
  );
}
