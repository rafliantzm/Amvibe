import { createClient } from '@/utils/supabase/server'
import { PRDInteractiveView } from '@/components/ui/PRDInteractiveView'
import { redirect } from 'next/navigation'

export default async function PRDHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  // First, verify the project belongs to the user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('name')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    redirect('/app/prd')
  }

  // Fetch ALL PRD versions for this project
  const { data: versions, error: versionsError } = await supabase
    .from('prd_versions')
    .select('version_number, content, created_at')
    .eq('project_id', id)
    .order('version_number', { ascending: false })

  if (versionsError || !versions || versions.length === 0) {
    redirect('/app/prd')
  }

  return <PRDInteractiveView projectId={id} projectName={project.name} initialVersions={versions} />
}
