import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAIL = 'raflian100@gmail.com'

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// GET /api/admin/users — list all users with metadata
export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabase = getServiceClient()

    // Use Supabase Admin API to list users
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })

    }

    // Get project counts from the database
    let projectCounts: Record<string, number> = {}
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('user_id')
      if (projects) {
        for (const p of projects) {
          projectCounts[p.user_id] = (projectCounts[p.user_id] ?? 0) + 1
        }
      }
    } catch {
      // projects table may not exist, ignore
    }

    const enriched = users.map(u => ({
      id: u.id,
      email: u.email ?? '—',
      name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
      avatar: u.user_metadata?.avatar_url ?? null,
      provider: u.app_metadata?.provider ?? 'email',
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
      banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
      confirmed: !!u.email_confirmed_at,
      projectCount: projectCounts[u.id] ?? 0,
    }))

    return NextResponse.json({ users: enriched, total: enriched.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/admin/users — ban / unban a user
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { userId, action } = await req.json()
    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    const supabase = getServiceClient()

    if (action === 'ban') {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h', // ~100 years
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
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/admin/users — delete a user permanently
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'User permanently deleted.' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
