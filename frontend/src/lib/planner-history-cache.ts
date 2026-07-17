export interface CachedPlannerVersion {
  id: string
  project_id: string
  agent_name: string
  content: string
  created_at: string
}

const CACHE_PREFIX = 'amvibe:planner-history:'
const MAX_ENTRIES_PER_PROJECT = 12

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getStorageKey(projectId: string) {
  return `${CACHE_PREFIX}${projectId}`
}

export function readPlannerHistoryCache(projectId: string): CachedPlannerVersion[] {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(getStorageKey(projectId))
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is CachedPlannerVersion => {
        return !!item
          && typeof item.id === 'string'
          && typeof item.project_id === 'string'
          && typeof item.agent_name === 'string'
          && typeof item.content === 'string'
          && typeof item.created_at === 'string'
      })
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
  } catch {
    return []
  }
}

export function writePlannerHistoryCache(entry: CachedPlannerVersion) {
  if (!canUseStorage()) return

  const current = readPlannerHistoryCache(entry.project_id)
  const merged = mergePlannerHistory([entry], current).slice(0, MAX_ENTRIES_PER_PROJECT)
  window.localStorage.setItem(getStorageKey(entry.project_id), JSON.stringify(merged))
}

export function removePlannerHistoryCache(projectId: string, planId: string) {
  if (!canUseStorage()) return

  const nextItems = readPlannerHistoryCache(projectId).filter((item) => item.id !== planId)
  window.localStorage.setItem(getStorageKey(projectId), JSON.stringify(nextItems))
}

export function mergePlannerHistory<T extends CachedPlannerVersion>(primary: T[], fallback: T[]): T[] {
  const merged = new Map<string, T>()

  for (const item of [...primary, ...fallback]) {
    const contentSignature = `${item.project_id}::${item.agent_name}::${item.created_at}::${item.content.slice(0, 120)}`
    const key = item.id.startsWith('local-') ? contentSignature : item.id

    if (!merged.has(key)) {
      merged.set(key, item)
    }
  }

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  )
}
