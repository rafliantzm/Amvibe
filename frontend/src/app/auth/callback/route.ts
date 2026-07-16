import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resolveAppOrigin } from '@/utils/app-origin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const safeOrigin = resolveAppOrigin({ requestUrl: request.url })
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
