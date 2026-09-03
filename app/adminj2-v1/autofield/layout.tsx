import { SuperAdminThemeProvider } from '@/components/providers/SuperAdminThemeProvider'
import { createSupabaseServerClient, getRoleFromJWT } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || getRoleFromJWT(session) !== 'super_admin') {
    redirect('/adminj2-v1/autofield/login')
  }

  return (
    <SuperAdminThemeProvider>
      {children}
    </SuperAdminThemeProvider>
  )
}
