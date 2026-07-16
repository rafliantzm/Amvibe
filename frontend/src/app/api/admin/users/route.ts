import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminServiceClient, loadAdminUsers } from '@/lib/admin/users'

const ADMIN_EMAIL = 'raflian100@gmail.com'

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

// GET /api/admin/users - list all users with metadata
export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const payload = await loadAdminUsers()
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// PATCH /api/admin/users - ban / unban a user
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { userId, action } = await req.json() as { userId?: string; action?: string }
    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    const supabase = getAdminServiceClient()

    if (action === 'ban') {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h',
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'User banned.' })
    }

    if (action === 'unban') {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'User unbanned.' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// DELETE /api/admin/users - delete a user permanently
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { userId } = await req.json() as { userId?: string }
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = getAdminServiceClient()
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'User permanently deleted.' })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
