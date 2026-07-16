import Link from 'next/link'
import { ArrowRight, Clock3, Command, FileCode2, FileSearch, FolderKanban, Search, Sparkles, TerminalSquare } from 'lucide-react'

import { getWorkspaceSearchPayload, type SearchResult, type SearchResultKind } from '@/lib/workspace-search'

export const dynamic = 'force-dynamic'

const resultKindMeta: Record<
  SearchResultKind,
  {
    icon: typeof FolderKanban
    label: string
    accent: string
    border: string
    glow: string
  }
> = {
  project: {
    icon: FolderKanban,
    label: 'Project',
    accent: 'text-sky-300',
    border: 'border-sky-400/20',
    glow: 'bg-sky-400/10',
  },
  prd: {
    icon: FileSearch,
    label: 'PRD',
    accent: 'text-emerald-300',
    border: 'border-emerald-400/20',
    glow: 'bg-emerald-400/10',
  },
  planner: {
    icon: TerminalSquare,
    label: 'Planner',
    accent: 'text-violet-300',
    border: 'border-violet-400/20',
    glow: 'bg-violet-400/10',
  },
  prompt: {
    icon: FileCode2,
    label: 'Prompt',
    accent: 'text-amber-300',
    border: 'border-amber-400/20',
    glow: 'bg-amber-400/10',
  },
}

function normalizeQueryParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function SearchCard({ result }: { result: SearchResult }) {
  const meta = resultKindMeta[result.kind]
  const Icon = meta.icon

  return (
    <Link
      href={result.href}
      className={`group block rounded-[24px] border ${meta.border} bg-[#050505]/65 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] transition-all duration-300 hover:bg-white/[0.04] hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] ${meta.glow} ${meta.accent}`}>
          <Icon size={18} />
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#8a8a93]">
          {meta.label}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-semibold tracking-tight text-white">{result.title}</h3>
        <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[#7c7c86]">{result.subtitle}</p>
        <p className="mt-4 text-sm leading-6 text-[#a1a1aa]">{result.snippet}</p>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a8a93] transition-colors group-hover:text-white">
        <span>Open result</span>
        <ArrowRight size={13} />
      </div>
    </Link>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const query = normalizeQueryParam(params.q)
  const payload = await getWorkspaceSearchPayload(query)

  return (
    <div className="flex h-screen w-full flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto app-scroll-surface" tabIndex={0}>
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">
              <Sparkles size={12} className="text-[#34d399]" />
              <span>Global Search</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Search your workspace,
              <span className="block text-[#7c7c86]">without breaking flow.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#8a8a93] md:text-base">
              Search runs against your owned projects, latest PRDs, planner outputs, and extracted coding prompts.
              Results are grouped so you can jump straight back into the right execution surface.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.85fr)]">
            <section className="rounded-[30px] border border-white/[0.08] bg-[#050505]/70 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl">
              <form action="/app/search" method="GET" className="rounded-[24px] border border-white/[0.06] bg-black/20 p-3">
                <div className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#34d399]">
                    <Search size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="workspace-search" className="sr-only">
                      Search workspace
                    </label>
                    <input
                      id="workspace-search"
                      name="q"
                      defaultValue={payload.query}
                      placeholder="Search PRDs, planners, prompts, and projects..."
                      className="w-full bg-transparent text-sm text-[#d4d4d8] outline-none placeholder:text-[#6b7280]"
                    />
                    <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[#5f5f68]">
                      {payload.hasQuery ? `${payload.totalResults} result${payload.totalResults === 1 ? '' : 's'} ready` : 'Search current workspace data'}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#8a8a93] transition-colors hover:text-white md:inline-flex"
                  >
                    <Command size={11} />
                    <span>Enter</span>
                  </button>
                </div>
              </form>

              {payload.sections.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-black/20 text-[#7c7c86]">
                    <Search size={18} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">No matching results yet</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8a8a93]">
                    Try a project name, a domain keyword inside your PRD, an implementation detail from planner output,
                    or a task phrase from your extracted coding prompts.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {payload.sections.map((section) => (
                    <div key={section.key}>
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold tracking-tight text-white">{section.label}</h2>
                          <p className="mt-1 text-sm leading-6 text-[#8a8a93]">{section.description}</p>
                        </div>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#8a8a93]">
                          {section.results.length} hit{section.results.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {section.results.map((result) => (
                          <SearchCard key={result.id} result={result} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-4 rounded-[30px] border border-white/[0.08] bg-[#050505]/65 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
                  <Clock3 size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7c7c86]">Status</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-white">Live workspace search</p>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/[0.06] bg-black/20 p-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#6b7280]">What works today</p>
                <p className="mt-3 text-sm leading-6 text-[#a1a1aa]">
                  Query owned projects, latest PRD content, planner history, and extracted prompt phases from one route.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#34d399]/15 bg-[#34d399]/[0.04] p-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7ee7c4]">Usage tips</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#b7f7e3]">
                  <li>Search by product name to jump straight into a project.</li>
                  <li>Search by technical phrase to find matching PRD or planner content.</li>
                  <li>Search by task wording to surface coding prompts you can reuse immediately.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
