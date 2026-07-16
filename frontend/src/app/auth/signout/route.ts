import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { resolveAppOrigin } from '@/utils/app-origin'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(`${resolveAppOrigin({ requestUrl: request.url })}/login`, {
    status: 302,
  })
}
