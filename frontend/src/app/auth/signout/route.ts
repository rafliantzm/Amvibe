import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${normalizeAppOrigin(origin)}/login`, { status: 302 })
}
