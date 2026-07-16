import 'server-only'

import fs from 'fs'
import path from 'path'

import { createClient } from '@/utils/supabase/server'
import { extractPrompts } from './prompts'

interface ProjectRecord {
  id: string
  name: string
  created_at: string
}

interface PrdVersionRecord {
  id: string
  project_id: string
  version_number: number
  content: string
  created_at: string
}

interface PlannerHistoryRecord {
  id: string
  project_id: string
  agent_name: string
  content: string
  created_at: string
}

export type SearchResultKind = 'project' | 'prd' | 'planner' | 'prompt'

export interface SearchResult {
  id: string
  kind: SearchResultKind
  title: string
  href: string
  snippet: string
  subtitle: string
  createdAt: string
  score: number
}

export interface SearchSection {
  key: SearchResultKind
  label: string
  description: string
  results: SearchResult[]
}

export interface WorkspaceSearchPayload {
  query: string
  sections: SearchSection[]
  totalResults: number
  hasQuery: boolean
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const historyFilePath = path.join(process.cwd(), 'data', 'planner_history.json')
const MAX_PROJECTS_FOR_QUERY = 50
const MAX_PROJECTS_FOR_OVERVIEW = 16
const OVERVIEW_CONTENT_PROJECT_WINDOW = 12
const MAX_PRD_ROWS_FOR_QUERY = 200
const MAX_PRD_ROWS_FOR_OVERVIEW = 48
const MAX_PROMPT_SOURCES_FOR_OVERVIEW = 8
const MAX_PROMPT_CACHE_ENTRIES = 100

let plannerHistoryCache: { data: PlannerHistoryRecord[]; mtimeMs: number } | null = null
const promptExtractionCache = new Map<string, ReturnType<typeof extractPrompts>>()

function readPlannerHistory(): PlannerHistoryRecord[] {
  if (!fs.existsSync(historyFilePath)) {
    plannerHistoryCache = null
    return []
  }

  const stats = fs.statSync(historyFilePath)
  if (plannerHistoryCache && plannerHistoryCache.mtimeMs === stats.mtimeMs) {
    return plannerHistoryCache.data
  }

  const data = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8')) as PlannerHistoryRecord[]
  plannerHistoryCache = {
    data,
    mtimeMs: stats.mtimeMs,
  }

  return data
}

function getExtractedPrompts(planner: PlannerHistoryRecord) {
  const cacheKey = `${planner.id}:${planner.created_at}:${planner.content.length}`
  const cached = promptExtractionCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const extracted = extractPrompts(planner.content)

  if (promptExtractionCache.size >= MAX_PROMPT_CACHE_ENTRIES) {
    const firstKey = promptExtractionCache.keys().next().value
    if (firstKey) {
      promptExtractionCache.delete(firstKey)
    }
  }

  promptExtractionCache.set(cacheKey, extracted)
  return extracted
}

function normalizeText(value: string) {
  return value
    .replace(/[`*_>#|[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(query: string) {
  return normalizeText(query)
    .toLowerCase()
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
}

function formatAgentName(agentName: string) {
  return agentName
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildSnippet(text: string, query: string) {
  const cleaned = normalizeText(text)
  if (!cleaned) return 'No preview available yet.'

  const lowered = cleaned.toLowerCase()
  const loweredQuery = query.toLowerCase()
  const startIndex = loweredQuery ? lowered.indexOf(loweredQuery) : -1

  if (startIndex === -1) {
    return cleaned.slice(0, 180) + (cleaned.length > 180 ? 'â€¦' : '')
  }

  const sliceStart = Math.max(0, startIndex - 70)
  const sliceEnd = Math.min(cleaned.length, startIndex + loweredQuery.length + 110)
  const prefix = sliceStart > 0 ? 'â€¦' : ''
  const suffix = sliceEnd < cleaned.length ? 'â€¦' : ''
  return `${prefix}${cleaned.slice(sliceStart, sliceEnd)}${suffix}`
}

function scoreMatch(query: string, title: string, ...fields: string[]) {
  if (!query) return 0

  const tokens = tokenize(query)
  if (tokens.length === 0) return 0

  const loweredTitle = normalizeText(title).toLowerCase()
  const loweredBody = normalizeText(fields.join(' ')).toLowerCase()
  const phrase = normalizeText(query).toLowerCase()

  let score = 0

  if (loweredTitle.includes(phrase)) score += 40
  if (loweredBody.includes(phrase)) score += 22

  for (const token of tokens) {
    if (loweredTitle.includes(token)) score += 10
    if (loweredBody.includes(token)) score += 4
  }

  const matchedTokens = tokens.filter((token) => loweredTitle.includes(token) || loweredBody.includes(token))
  if (matchedTokens.length === tokens.length) score += 12

  return score
}

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

function pickLatestByProject<T extends { project_id: string; created_at: string }>(items: T[]) {
  const latest = new Map<string, T>()

  for (const item of items) {
    const current = latest.get(item.project_id)
    if (!current || new Date(item.created_at).getTime() > new Date(current.created_at).getTime()) {
      latest.set(item.project_id, item)
    }
  }

  return latest
}

async function fetchPrdVersions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectIds: string[],
  limit: number
) {
  if (projectIds.length === 0) {
    return [] as PrdVersionRecord[]
  }

  const { data } = await supabase
    .from('prd_versions')
    .select('id, project_id, version_number, content, created_at')
    .in('project_id', projectIds)
    .order('version_number', { ascending: false })
    .limit(limit)

  return (data ?? []) as PrdVersionRecord[]
}

export async function getWorkspaceSearchPayload(query: string): Promise<WorkspaceSearchPayload> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const normalizedQuery = query.trim()
  const hasQuery = normalizedQuery.length > 0

  if (!user) {
    return {
      query: normalizedQuery,
      sections: [],
      totalResults: 0,
      hasQuery,
    }
  }

  const projectFetchLimit = hasQuery ? MAX_PROJECTS_FOR_QUERY : MAX_PROJECTS_FOR_OVERVIEW
  const { data: projects = [] } = await supabase
    .from('projects')
    .select('id, name, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(projectFetchLimit)

  const typedProjects = projects as ProjectRecord[]
  const projectById = new Map(typedProjects.map((project) => [project.id, project]))
  const contentProjects = hasQuery
    ? typedProjects
    : typedProjects.slice(0, OVERVIEW_CONTENT_PROJECT_WINDOW)
  const contentProjectIds = contentProjects.map((project) => project.id)
  const contentProjectIdSet = new Set(contentProjectIds)

  const [prdVersions, plannerHistoryAll] = await Promise.all([
    fetchPrdVersions(
      supabase,
      contentProjectIds,
      hasQuery ? MAX_PRD_ROWS_FOR_QUERY : MAX_PRD_ROWS_FOR_OVERVIEW
    ),
    Promise.resolve(readPlannerHistory()),
  ])

  const latestPrdByProject = new Map<string, PrdVersionRecord>()
  for (const version of prdVersions) {
    const current = latestPrdByProject.get(version.project_id)
    if (!current || version.version_number > current.version_number) {
      latestPrdByProject.set(version.project_id, version)
    }
  }

  const plannerHistory = plannerHistoryAll.filter((item) => contentProjectIdSet.has(item.project_id))
  const latestPlannerByProject = pickLatestByProject(plannerHistory)
  const prdSource = hasQuery ? prdVersions : Array.from(latestPrdByProject.values())
  const plannerSource = hasQuery ? plannerHistory : Array.from(latestPlannerByProject.values())

  const projectResults: SearchResult[] = typedProjects.map((project) => ({
    id: `project-${project.id}`,
    kind: 'project',
    title: project.name,
    href: `/app/prd/${project.id}`,
    snippet: 'Open this project workspace and review its latest PRD history.',
    subtitle: `Project â€¢ Updated ${formatDate(project.created_at)}`,
    createdAt: project.created_at,
    score: scoreMatch(normalizedQuery, project.name, project.name),
  }))

  const prdResults: SearchResult[] = prdSource.flatMap((version) => {
    const project = projectById.get(version.project_id)
    if (!project) return []

    return [{
      id: `prd-${version.id}`,
      kind: 'prd' as const,
      title: project.name,
      href: `/app/prd/${project.id}`,
      snippet: buildSnippet(version.content, normalizedQuery),
      subtitle: `${hasQuery ? 'PRD match' : 'Latest PRD'} â€¢ Version ${version.version_number} â€¢ ${formatDate(version.created_at)}`,
      createdAt: version.created_at,
      score: scoreMatch(normalizedQuery, project.name, version.content, `version ${version.version_number}`),
    }]
  })

  const plannerScoreById = new Map<string, number>()
  const plannerResults: SearchResult[] = plannerSource.flatMap((planner) => {
    const project = projectById.get(planner.project_id)
    if (!project) return []

    const score = scoreMatch(normalizedQuery, project.name, planner.content, planner.agent_name)
    plannerScoreById.set(planner.id, score)

    return [{
      id: `planner-${planner.id}`,
      kind: 'planner' as const,
      title: project.name,
      href: `/app/planner?view=${planner.project_id}`,
      snippet: buildSnippet(planner.content, normalizedQuery),
      subtitle: `${formatAgentName(planner.agent_name)} planner â€¢ ${formatDate(planner.created_at)}`,
      createdAt: planner.created_at,
      score,
    }]
  })

  const promptPlannerSource = hasQuery
    ? plannerSource.filter((planner) => (plannerScoreById.get(planner.id) ?? 0) > 0)
    : plannerSource.slice(0, MAX_PROMPT_SOURCES_FOR_OVERVIEW)

  const promptResults: SearchResult[] = promptPlannerSource.flatMap((planner) => {
    const project = projectById.get(planner.project_id)
    if (!project) return []

    return getExtractedPrompts(planner).map((prompt, index) => {
      const promptText = [prompt.objective, prompt.tasks.join(' '), prompt.prompt, prompt.verification]
        .filter(Boolean)
        .join(' ')

      return {
        id: `prompt-${planner.id}-${index}`,
        kind: 'prompt' as const,
        title: `${project.name} â€¢ ${prompt.phaseName}`,
        href: `/app/prompts?view=${planner.project_id}`,
        snippet: buildSnippet(promptText, normalizedQuery),
        subtitle: `Coding prompt â€¢ ${formatDate(planner.created_at)}`,
        createdAt: planner.created_at,
        score: scoreMatch(normalizedQuery, `${project.name} ${prompt.phaseName}`, promptText),
      }
    })
  })

  const resultLimit = hasQuery ? 6 : 4
  const filterAndLimit = (results: SearchResult[]) =>
    results
      .filter((result) => !hasQuery || result.score > 0)
      .sort((left, right) => {
        if (hasQuery && right.score !== left.score) {
          return right.score - left.score
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      })
      .slice(0, resultLimit)

  const sections: SearchSection[] = [
    {
      key: 'project' as const,
      label: hasQuery ? 'Projects' : 'Recent Projects',
      description: hasQuery
        ? 'Project names and workspace entries that match your query.'
        : 'Jump back into the latest workspaces you opened or generated.',
      results: filterAndLimit(projectResults),
    },
    {
      key: 'prd' as const,
      label: hasQuery ? 'PRD Documents' : 'Latest PRDs',
      description: hasQuery
        ? 'Searches the latest PRD content stored for each owned project.'
        : 'Open the newest PRD history for your recent work.',
      results: filterAndLimit(prdResults),
    },
    {
      key: 'planner' as const,
      label: hasQuery ? 'Implementation Plans' : 'Recent Planners',
      description: hasQuery
        ? 'Find planner output and implementation roadmap content.'
        : 'Resume the latest implementation plans generated for your projects.',
      results: filterAndLimit(plannerResults),
    },
    {
      key: 'prompt' as const,
      label: hasQuery ? 'Coding Prompts' : 'Prompt Destinations',
      description: hasQuery
        ? 'Matches extracted agent prompts and phase instructions.'
        : 'Open prompt-ready outputs derived from your latest planner runs.',
      results: filterAndLimit(promptResults),
    },
  ].filter((section) => section.results.length > 0)

  return {
    query: normalizedQuery,
    sections,
    totalResults: sections.reduce((sum, section) => sum + section.results.length, 0),
    hasQuery,
  }
}
