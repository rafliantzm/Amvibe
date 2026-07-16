import { createClient } from '@/utils/supabase/server'
import { loadAdminAiConfig } from '@/lib/admin/ai-config'
import AiConfigPageClient from './page-client'

export default async function AiConfigPage() {
  const supabase = await createClient()
  const initialData = await loadAdminAiConfig(supabase)

  return <AiConfigPageClient initialData={initialData} />
}
