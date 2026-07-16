import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

interface PlannerHistoryItem {
  id: string
  project_id: string
  agent_name: string
  content: string
  created_at: string
}

function getHistoryFilePath() {
  return path.join(process.cwd(), 'data', 'planner_history.json')
}

function readPlannerHistory(): PlannerHistoryItem[] {
  const historyFile = getHistoryFilePath()

  if (!fs.existsSync(historyFile)) {
    return []
  }

  const rawHistory = fs.readFileSync(historyFile, 'utf-8')
  return JSON.parse(rawHistory) as PlannerHistoryItem[]
}

async function requireOwnedProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: new NextResponse('Unauthorized', { status: 401 }) }
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !project) {
    return { error: new NextResponse('Forbidden', { status: 403 }) }
  }

  return { error: null }
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

    const history = readPlannerHistory()
    const projectHistory = history.filter((item) => item.project_id === projectId)

    return NextResponse.json(projectHistory)
  } catch (error) {
    console.error('Error fetching planner history:', error)
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

    const history = readPlannerHistory()
    const targetPlan = history.find((item) => item.id === planId)

    if (!targetPlan) {
      return new NextResponse('Plan not found', { status: 404 })
    }

    const access = await requireOwnedProject(targetPlan.project_id)
    if (access.error) {
      return access.error
    }

    const historyFile = getHistoryFilePath()
    const newHistory = history.filter((item) => item.id !== planId)
    fs.writeFileSync(historyFile, JSON.stringify(newHistory, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting planner history:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
