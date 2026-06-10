import { createClient } from '@/utils/supabase/server'
import ClientLayout from './ClientLayout'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === 'raflian100@gmail.com'

  // Fetch recent projects history
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(15)

  // Fetch local planner history
  let planners = [];
  try {
    const fs = require('fs');
    const path = require('path');
    const historyFile = path.join(process.cwd(), 'data', 'planner_history.json');
    if (fs.existsSync(historyFile)) {
      planners = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load planner history', e);
  }

  const adminConfig = isAdmin ? {
    menuLabel: 'Admin Panel',
    commandLabel: 'Admin Dashboard',
    commandDesc: 'Enter God-Mode oversight panel'
  } : null;

  return (
    <ClientLayout userEmail={user?.email} isAdmin={isAdmin} adminConfig={adminConfig} projects={projects || []} planners={planners}>
      {children}
    </ClientLayout>
  )
}
