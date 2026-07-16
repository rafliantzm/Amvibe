import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { invalidateAiConfigCache } from '@/lib/getAiConfig'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { AVAILABLE_MODELS, loadAdminAiConfig } from '@/lib/admin/ai-config'

const ADMIN_EMAIL = 'raflian100@gmail.com'

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) return null

  return { user, supabase }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

// GET /api/admin/ai-config - return current config (masked key) + model list
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const payload = await loadAdminAiConfig(admin.supabase)
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// POST /api/admin/ai-config - update config
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { apiKey, modelId, testOnly } = await req.json() as {
      apiKey?: string
      modelId?: string
      testOnly?: boolean
    }

    const selectedModel = AVAILABLE_MODELS.find((model) => model.id === modelId)
    if (!selectedModel) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 })
    }

    const keyToUse = apiKey?.trim()
    if (!keyToUse) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 })
    }

    try {
      const googleAi = createGoogleGenerativeAI({ apiKey: keyToUse })
      await generateText({
        model: googleAi(selectedModel.id),
        prompt: 'Say "OK" in one word.',
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Connection test failed: ${getErrorMessage(error)}` },
        { status: 400 }
      )
    }

    if (testOnly) {
      return NextResponse.json({ success: true, message: 'Connection test successful!' })
    }

    const { supabase } = admin

    await supabase.from('ai_config').update({ is_active: false }).eq('is_active', true)

    const { error: insertError } = await supabase.from('ai_config').insert({
      api_key: keyToUse,
      model_id: selectedModel.id,
      is_active: true,
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json(
        { error: `Database error: ${insertError.message}. Please run the SQL migration in Supabase first.` },
        { status: 500 }
      )
    }

    invalidateAiConfigCache()

    return NextResponse.json({ success: true, message: 'AI configuration saved successfully!' })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
