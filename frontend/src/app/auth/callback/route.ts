import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const safeOrigin = normalizeAppOrigin(origin)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${safeOrigin}/app`)
    }
    console.error('Supabase Auth Error in Callback:', error)
  } else {
    console.error('No code found in URL searchParams')
  }

  return NextResponse.redirect(`${safeOrigin}/login?error=OAuth+Callback+Failed`)
}
