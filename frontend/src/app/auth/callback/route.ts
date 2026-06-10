import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    console.log('--- DEBUG IN ROUTE.TS ---')
    console.log('ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/app`)
    }
    console.error('Supabase Auth Error in Callback:', error)
  } else {
    console.error('No code found in URL searchParams')
  }

  return NextResponse.redirect(`${origin}/login?error=OAuth+Callback+Failed`)
}
