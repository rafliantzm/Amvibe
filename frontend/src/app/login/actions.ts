'use server'

import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

function normalizeAppOrigin(origin: string) {
  try {
    const url = new URL(origin)
    if (url.hostname === '0.0.0.0') {
      url.hostname = 'localhost'
    }

    return url.origin
  } catch {
    return 'http://localhost:3000'
  }
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const headerStore = await headers()
  const forwardedProto = headerStore.get('x-forwarded-proto')
  const forwardedHost = headerStore.get('x-forwarded-host') ?? headerStore.get('host')
  const requestOrigin = normalizeAppOrigin(forwardedHost
    ? `${forwardedProto ?? 'http'}://${forwardedHost}`
    : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${requestOrigin}/auth/callback`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    console.error('Google OAuth error', error)
    redirect('/login?error=Could not authenticate user')
  }

  if (data.url) {
    redirect(data.url) // Navigate to the Supabase OAuth URL
  }
}
