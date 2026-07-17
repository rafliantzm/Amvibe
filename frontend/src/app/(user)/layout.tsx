import { createClient } from '@/utils/supabase/server'

import ClientLayout from './ClientLayout'

interface PlannerHistorySummary {
  id: string
  project_id: string
  agent_name: string
  content: string
  created_at: string
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAdmin = user?.email === 'raflian100@gmail.com'

  const [{ data: projects }, { data: planners }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('planner_versions')
      .select('id, project_id, agent_name, content, created_at')
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const adminConfig = isAdmin
    ? {
        menuLabel: 'Admin Panel',
        commandLabel: 'Admin Dashboard',
        commandDesc: 'Enter God-Mode oversight panel',
      }
    : null

  return (
    <ClientLayout
      userEmail={user?.email}
      isAdmin={isAdmin}
      adminConfig={adminConfig}
      projects={projects || []}
      planners={(planners || []) as PlannerHistorySummary[]}
    >
      {children}
    </ClientLayout>
  )
}
