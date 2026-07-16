import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface UserRow {
  id: string
  email: string
  name: string | null
  avatar: string | null
  provider: string
  createdAt: string
  lastSignIn: string | null
  banned: boolean
  confirmed: boolean
  projectCount: number
}

export interface AdminUsersStats {
  total: number
  active: number
  banned: number
  confirmed: number
}

export interface AdminUsersPayload {
  users: UserRow[]
  total: number
  stats: AdminUsersStats
}

function getMetadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== 'object') return null
  const value = (metadata as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : null
}

export function getAdminServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin user management')
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function loadAdminUsers(): Promise<AdminUsersPayload> {
  const supabase = getAdminServiceClient()

  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  })

  if (error) {
    throw new Error(error.message)
  }

  const projectCounts: Record<string, number> = {}
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('owner_id')

    if (projects) {
      for (const project of projects) {
        const ownerId = typeof project.owner_id === 'string' ? project.owner_id : null
        if (ownerId) {
          projectCounts[ownerId] = (projectCounts[ownerId] ?? 0) + 1
        }
      }
    }
  } catch {
    // projects table may not exist, ignore
  }

  const enriched: UserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email ?? '—',
    name: getMetadataString(user.user_metadata, 'full_name') ?? getMetadataString(user.user_metadata, 'name'),
    avatar: getMetadataString(user.user_metadata, 'avatar_url'),
    provider: getMetadataString(user.app_metadata, 'provider') ?? 'email',
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at ?? null,
    banned: user.banned_until ? new Date(user.banned_until) > new Date() : false,
    confirmed: !!user.email_confirmed_at,
    projectCount: projectCounts[user.id] ?? 0,
  }))

  return {
    users: enriched,
    total: enriched.length,
    stats: {
      total: enriched.length,
      active: enriched.filter((user) => !user.banned).length,
      banned: enriched.filter((user) => user.banned).length,
      confirmed: enriched.filter((user) => user.confirmed).length,
    },
  }
}
