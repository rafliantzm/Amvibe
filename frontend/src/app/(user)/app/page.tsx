import { createClient } from '@/utils/supabase/server'
import UserDashboardClient, { type DashboardStats } from './page-client'

export default async function UserDashboard() {
  const supabase = await createClient()

  const [{ count: projectCount }, { count: prdCount }] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('prd_versions').select('*', { count: 'exact', head: true }),
  ])

  const initialStats: DashboardStats = {
    projects: projectCount ?? 0,
    prds: prdCount ?? 0,
  }

  return <UserDashboardClient initialStats={initialStats} />
}
