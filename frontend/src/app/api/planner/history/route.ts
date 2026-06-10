import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return new NextResponse('Project ID required', { status: 400 })
    }

    const dataDir = path.join(process.cwd(), 'data')
    const historyFile = path.join(dataDir, 'planner_history.json')

    if (!fs.existsSync(historyFile)) {
      return NextResponse.json([])
    }

    const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'))
    const projectHistory = history.filter((item: any) => item.project_id === projectId)

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

    const dataDir = path.join(process.cwd(), 'data')
    const historyFile = path.join(dataDir, 'planner_history.json')

    if (!fs.existsSync(historyFile)) {
      return new NextResponse('History file not found', { status: 404 })
    }

    const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'))
    const newHistory = history.filter((item: any) => item.id !== planId)

    if (history.length === newHistory.length) {
      return new NextResponse('Plan not found', { status: 404 })
    }

    fs.writeFileSync(historyFile, JSON.stringify(newHistory, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting planner history:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
