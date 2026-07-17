import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE project:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
