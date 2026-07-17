import { NextResponse } from 'next/server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

interface PlannerHistoryItem {
  id: string
  project_id: string
  agent_name: string
  content: string
  created_at: string
}

async function requireOwnedProject(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: new NextResponse('Unauthorized', { status: 401 }),
      supabase,
      user: null,
    }
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !project) {
    return {
      error: new NextResponse('Forbidden', { status: 403 }),
      supabase,
      user,
    }
  }

  return {
    error: null,
    supabase,
    user,
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return new NextResponse('Project ID required', { status: 400 })
    }

    const access = await requireOwnedProject(projectId)
    if (access.error) {
      return access.error
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('planner_versions')
      .select('id, project_id, agent_name, content, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching planner history from Supabase:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    return NextResponse.json((data ?? []) as PlannerHistoryItem[])
  } catch (error) {
    console.error('Error fetching planner history:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, agentName, content } = await req.json()

    if (!projectId || !agentName || !content) {
      return new NextResponse('projectId, agentName, and content are required', { status: 400 })
    }

    const access = await requireOwnedProject(projectId)
    if (access.error || !access.user) {
      return access.error ?? new NextResponse('Unauthorized', { status: 401 })
    }

    const trimmedContent = String(content).trim()
    if (!trimmedContent) {
      return new NextResponse('content must not be empty', { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('planner_versions')
      .insert({
        project_id: projectId,
        agent_name: agentName,
        content: trimmedContent,
        author_id: access.user.id,
      })
      .select('id, project_id, agent_name, content, created_at')
      .single()

    if (error) {
      console.error('Error saving planner history to Supabase:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    return NextResponse.json(data as PlannerHistoryItem, { status: 201 })
  } catch (error) {
    console.error('Error saving planner history:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const planId = searchParams.get('id')

    if (!planId) {
      return new NextResponse('Plan ID required', { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const admin = createAdminClient()
    const { data: planner, error: plannerError } = await admin
      .from('planner_versions')
      .select('id, project_id')
      .eq('id', planId)
      .single()

    if (plannerError || !planner) {
      return new NextResponse('Plan not found', { status: 404 })
    }

    const access = await requireOwnedProject(planner.project_id)
    if (access.error) {
      return access.error
    }

    const { error: deleteError } = await admin
      .from('planner_versions')
      .delete()
      .eq('id', planId)

    if (deleteError) {
      console.error('Error deleting planner history from Supabase:', deleteError)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting planner history:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
