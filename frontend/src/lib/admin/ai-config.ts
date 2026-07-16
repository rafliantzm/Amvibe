import { createClient as createServerClient } from '@/utils/supabase/server'

export interface ConfigData {
  id: string
  maskedApiKey: string
  modelId: string
  updatedAt: string
  isPlaceholder: boolean
}

export interface Model {
  id: string
  label: string
  rpm: string
  note: string
}

export interface AdminAiConfigPayload {
  config: ConfigData | null
  dbError: string | null
  activeModel: string
  usingEnvFallback: boolean
  availableModels: Model[]
}

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerClient>>

export const AVAILABLE_MODELS: Model[] = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', rpm: '4/5', note: 'Fast & balanced' },
  { id: 'gemini-2.5-flash-lite-preview-06-17', label: 'Gemini 2.5 Flash Lite', rpm: '1/10', note: 'Ultra-fast, lowest latency' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', rpm: '5/5', note: 'Most capable, complex reasoning' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', rpm: '1/5', note: 'Latest gen, stable' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', rpm: '9/15', note: 'Current default model' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', rpm: '2/15', note: 'Previous gen, reliable' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', rpm: '-', note: 'Legacy, high context (1M tokens)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', rpm: '-', note: 'Legacy, proven performance' },
  { id: 'gemma-4-27b-it', label: 'Gemma 4 27B', rpm: '2/15', note: 'Open model, unlimited TPM' },
]

function maskKey(key: string): string {
  if (!key || key.length < 8) return '********'
  return '****************' + key.slice(-4)
}

export async function loadAdminAiConfig(supabase: ServerSupabaseClient): Promise<AdminAiConfigPayload> {
  let configData: ConfigData | null = null
  let dbError: string | null = null

  try {
    const { data, error } = await supabase
      .from('ai_config')
      .select('id, api_key, model_id, is_active, updated_at')
      .eq('is_active', true)
      .single()

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
  } catch (error) {
    dbError = error instanceof Error ? `Could not connect to database: ${error.message}` : 'Could not connect to database.'
  }

  const envModelFallback = 'gemini-3.1-flash-lite'

  return {
    config: configData,
    dbError,
    activeModel: configData?.modelId ?? envModelFallback,
    usingEnvFallback: !configData,
    availableModels: AVAILABLE_MODELS,
  }
}
