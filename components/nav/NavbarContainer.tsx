import { createSiteSupabaseServerClient } from "@/lib/siteSupabaseServer";
import { Navbar } from "./Navbar";

export async function NavbarContainer() {
  const supabase = await createSiteSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Navbar user={user} />;
}