import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createClient } from '@supabase/supabase-js'

interface AiConfig {
  apiKey: string
  modelId: string
}

let cachedConfig: AiConfig | null = null
let cacheTime = 0
const CACHE_TTL_MS = 60_000 // cache for 1 minute

/**
 * Reads the active AI configuration from the database.
 * Falls back to environment variables if no DB config is found.
 * Results are cached for 60 seconds to reduce DB calls.
 */
export async function getAiConfig(): Promise<AiConfig> {
  const now = Date.now()
  if (cachedConfig && now - cacheTime < CACHE_TTL_MS) {
    return cachedConfig
  }

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (serviceRoleKey) {
      // Only use a service-role client when the key is explicitly configured.
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      )

      const { data, error } = await supabase
        .from('ai_config')
        .select('api_key, model_id')
        .eq('is_active', true)
        .single()

      if (!error && data && data.api_key && !data.api_key.startsWith('PLACEHOLDER')) {
        cachedConfig = { apiKey: data.api_key, modelId: data.model_id }
        cacheTime = now
        return cachedConfig
      }
    }
  } catch (e) {
    console.warn('[getAiConfig] Failed to fetch from DB, falling back to env:', e)
  }

  // Fallback to environment variable
  const envKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!envKey) {
    throw new Error('No AI API key configured. Please set one in the Admin Panel or GOOGLE_GENERATIVE_AI_API_KEY env var.')
  }

  return { apiKey: envKey, modelId: 'gemini-3.1-flash-lite' }
}

/**
 * Invalidates the cached config so the next request fetches fresh data.
 */
export function invalidateAiConfigCache() {
  cachedConfig = null
  cacheTime = 0
}

/**
 * Creates a google AI instance with the active API key and returns
 * both the model instance and the model ID string.
 */
export async function createAiModel() {
  const config = await getAiConfig()
  const googleAi = createGoogleGenerativeAI({ apiKey: config.apiKey })
  return {
    model: googleAi(config.modelId),
    modelId: config.modelId,
    apiKey: config.apiKey,
  }
}
