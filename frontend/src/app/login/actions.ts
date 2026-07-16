'use server'

import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { resolveAppOrigin } from '@/utils/app-origin'
import { redirect } from 'next/navigation'

export async function loginWithGoogle() {
  const supabase = await createClient()
  const headerStore = await headers()
  const forwardedProto = headerStore.get('x-forwarded-proto')
  const forwardedHost = headerStore.get('x-forwarded-host') ?? headerStore.get('host')
  const requestOrigin = resolveAppOrigin({
    forwardedProto,
    forwardedHost,
  })

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
