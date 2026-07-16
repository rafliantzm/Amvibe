import fs from 'fs'
import path from 'path'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface PlannerHistoryEntry {
  project_id: string
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return new NextResponse('Project ID required', { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Delete project (will cascade to prd_versions if configured, or we delete it directly)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('owner_id', user.id) // Ensure they own it

    if (deleteError) {
      console.error('Error deleting project:', deleteError)
      return new NextResponse('Failed to delete project', { status: 500 })
    }

    // Note: We also might want to clean up planner_history.json
    const dataDir = path.join(process.cwd(), 'data')
    const historyFile = path.join(dataDir, 'planner_history.json')

    if (fs.existsSync(historyFile)) {
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8')) as PlannerHistoryEntry[]
      const newHistory = history.filter((item) => item.project_id !== projectId)
      fs.writeFileSync(historyFile, JSON.stringify(newHistory, null, 2))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE project:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
