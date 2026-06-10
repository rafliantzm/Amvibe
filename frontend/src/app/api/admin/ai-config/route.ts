import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { invalidateAiConfigCache } from '@/lib/getAiConfig'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

const ADMIN_EMAIL = 'raflian100@gmail.com'

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash',                    label: 'Gemini 2.5 Flash',            rpm: '4/5',   note: 'Fast & balanced' },
  { id: 'gemini-2.5-flash-lite-preview-06-17', label: 'Gemini 2.5 Flash Lite',        rpm: '1/10',  note: 'Ultra-fast, lowest latency' },
  { id: 'gemini-2.5-pro',                      label: 'Gemini 2.5 Pro',               rpm: '5/5',   note: 'Most capable, complex reasoning' },
  { id: 'gemini-3.5-flash',                    label: 'Gemini 3.5 Flash',             rpm: '1/5',   note: 'Latest gen, stable' },
  { id: 'gemini-3.1-flash-lite',               label: 'Gemini 3.1 Flash Lite',        rpm: '9/15',  note: 'Current default model' },
  { id: 'gemini-2.0-flash',                    label: 'Gemini 2.0 Flash',             rpm: '2/15',  note: 'Previous gen, reliable' },
  { id: 'gemini-1.5-pro',                      label: 'Gemini 1.5 Pro',               rpm: '-',     note: 'Legacy, high context (1M tokens)' },
  { id: 'gemini-1.5-flash',                    label: 'Gemini 1.5 Flash',             rpm: '-',     note: 'Legacy, proven performance' },
  { id: 'gemma-4-27b-it',                      label: 'Gemma 4 27B',                  rpm: '2/15',  note: 'Open model, unlimited TPM' },
]

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return '••••••••'
  return '••••••••••••••••' + key.slice(-4)
}

// GET /api/admin/ai-config — return current config (masked key) + model list
export async function GET() {
  // Always return models list even if DB is unavailable
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let configData = null
  let dbError: string | null = null

  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('ai_config')
      .select('id, api_key, model_id, is_active, updated_at')
      .eq('is_active', true)
      .single()

    // PGRST116 = no rows (table exists but empty) — treat as no config
    // Other errors = DB/table not found — treat as no config + report warning
    if (error) {
      if (error.code !== 'PGRST116') {
        dbError = 'Database table not found. Please run the SQL migration in Supabase.'
      }
    } else if (data && !data.api_key.startsWith('PLACEHOLDER')) {
      configData = {
        id: data.id,
        maskedApiKey: maskKey(data.api_key),
        modelId: data.model_id,
        updatedAt: data.updated_at,
        isPlaceholder: false,
      }
    }
  } catch (e: any) {
    dbError = `Could not connect to database: ${e.message}`
  }

  // Determine the currently active model (env fallback)
  const envModelFallback = 'gemini-3.1-flash-lite' // matches what was hardcoded in routes

  return NextResponse.json({
    config: configData,
    dbError,
    activeModel: configData?.modelId ?? envModelFallback,
    usingEnvFallback: !configData,
    availableModels: AVAILABLE_MODELS,
  })
}

// POST /api/admin/ai-config — update config
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { apiKey, modelId, testOnly } = await req.json()

    // Validate model
    if (!AVAILABLE_MODELS.find(m => m.id === modelId)) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 })
    }

    const keyToUse = apiKey?.trim()
    if (!keyToUse) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 })
    }

    // Test connection
    try {
      const googleAi = createGoogleGenerativeAI({ apiKey: keyToUse })
      await generateText({
        model: googleAi(modelId),
        prompt: 'Say "OK" in one word.',
        maxTokens: 5,
      })
    } catch (testErr: any) {
      return NextResponse.json(
        { error: `Connection test failed: ${testErr.message || 'Invalid API Key or model'}` },
        { status: 400 }
      )
    }

    if (testOnly) {
      return NextResponse.json({ success: true, message: 'Connection test successful!' })
    }

    // Upsert into DB
    const supabase = getServiceClient()

    // Deactivate existing
    await supabase.from('ai_config').update({ is_active: false }).eq('is_active', true)

    // Insert new active config
    const { error: insertError } = await supabase.from('ai_config').insert({
      api_key: keyToUse,
      model_id: modelId,
      is_active: true,
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json({ error: `Database error: ${insertError.message}. Please run the SQL migration in Supabase first.` }, { status: 500 })
    }

    // Invalidate cache so next AI call uses new config
    invalidateAiConfigCache()

    return NextResponse.json({ success: true, message: 'AI configuration saved successfully!' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
