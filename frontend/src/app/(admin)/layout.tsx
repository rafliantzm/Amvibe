import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminLayoutClient from './AdminLayoutClient'

const ADMIN_EMAIL = 'raflian100@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Server-level guard: redirect non-admins immediately
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/app')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
