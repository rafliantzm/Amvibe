'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Code2, Layers, Terminal, Sparkles, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { GlitchText } from '@/components/ui/GlitchText'
import { NeuralMesh } from '@/components/ui/NeuralMesh'
import { MagneticButton } from '@/components/ui/MagneticButton'

interface Project {
  id: string
  name: string
}

interface PlannerVersion {
  id: string
  project_id: string
  agent_name: string
  content: string
  created_at: string
}

interface ExtractedPrompt {
  phaseName: string
  objective: string
  tasks: string[]
  prompt: string
  files: { file: string, purpose: string }[]
  acceptanceCriteria: string[]
  verification: string
}

function extractPrompts(markdown: string): ExtractedPrompt[] {
  // Support both old format (### Phase) and new format (### Phase N:)
  const blocks = markdown.split(/(?=### Phase \d)/)
  const parsed: ExtractedPrompt[] = []

  for (const block of blocks) {
    if (!block.trim().startsWith('### Phase')) continue
    const lines = block.split('\n')
    const headerLine = lines[0].replace('### ', '').trim()
    const phaseName = headerLine

    // Objective
    const objectiveMatch = block.match(/\*\*Objective\*\*:\s*(.+)/)
    const objective = objectiveMatch ? objectiveMatch[1].trim() : ''

    // Tasks (checkbox list under #### 📋 Tasks or **Tasks:**)
    const tasksSection = block.match(/####\s*📋\s*Tasks([\s\S]*?)(?=####|$)/)
    const tasks: string[] = []
    if (tasksSection) {
      const taskLines = tasksSection[1].match(/- \[ \] (.+)/g) || []
      taskLines.forEach(t => tasks.push(t.replace('- [ ] ', '').trim()))
    } else {
      // Fallback: old format
      const taskMatch = block.match(/\*\*Tasks:\*\*\s*(.+)/)
      if (taskMatch) tasks.push(taskMatch[1].trim())
    }

    // Agent Prompt — extract content inside ``` code block
    let prompt = ''
    const promptCodeBlock = block.match(/####\s*🤖\s*Agent Prompt[\s\S]*?```(?:bash|text)?\n?([\s\S]*?)```/)
    if (promptCodeBlock) {
      prompt = promptCodeBlock[1].trim()
    } else {
      // Fallback: old format
      const oldFormat = block.match(/\*\*Agent Prompt:\*\*\s*`([^`]+)`/)
      if (oldFormat) prompt = oldFormat[1].trim()
    }

    // Expected Files — parse markdown table
    const files: { file: string, purpose: string }[] = []
    const tableSection = block.match(/####\s*📁\s*Expected Files[\s\S]*?(\|.+\|[\s\S]*?)(?=####|---\n|$)/)
    if (tableSection) {
      const tableRows = tableSection[1].split('\n').filter(r => r.includes('|') && !r.includes('---'))
      tableRows.slice(1).forEach(row => {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean)
        if (cols.length >= 2) {
          files.push({ file: cols[0].replace(/`/g, ''), purpose: cols[1] })
        }
      })
    } else {
      // Fallback: old format
      const filesMatch = block.match(/\*\*Expected Files:\*\*\s*(.+)/)
      if (filesMatch) files.push({ file: filesMatch[1].trim(), purpose: '' })
    }

    // Acceptance Criteria
    const acceptanceCriteria: string[] = []
    const acSection = block.match(/####\s*✅\s*Acceptance Criteria([\s\S]*?)(?=####|$)/)
    if (acSection) {
      const acLines = acSection[1].match(/- \[ \] (.+)/g) || []
      acLines.forEach(a => acceptanceCriteria.push(a.replace('- [ ] ', '').trim()))
    }

    // Verification commands
    let verification = ''
    const verifySection = block.match(/####\s*🔍\s*Verification[\s\S]*?```bash\n([\s\S]*?)```/)
    if (verifySection) {
      verification = verifySection[1].trim()
    } else {
      const oldVerify = block.match(/\*\*Verification:\*\*\s*`([^`]+)`/)
      if (oldVerify) verification = oldVerify[1].trim()
    }

    if (prompt || tasks.length > 0) {
      parsed.push({ phaseName, objective, tasks, prompt, files, acceptanceCriteria, verification })
    }
  }

  return parsed
}

function PromptCard({ index, item }: { index: number, item: ExtractedPrompt }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#030303]/80 backdrop-blur-xl border border-white/[0.04] rounded-[24px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] group/card hover:border-white/[0.15] transition-all duration-500 flex flex-col group-hover/list:opacity-30 hover:!opacity-100 hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-0 hover:z-10 relative"
    >
      {/* Terminal Header */}
      <div className="px-5 py-3 border-b border-white/[0.04] bg-[#0a0a0a] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-4">
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]"></div>
          </div>
          <h3 className="font-mono text-[12px] font-bold text-[#a1a1aa] uppercase tracking-[0.15em] flex items-center">
            Phase_{String(index).padStart(2, '0')}: {item.phaseName.toUpperCase()}
          </h3>
        </div>
        <MagneticButton strength={20}>
        <button
          onClick={handleCopy}
          className={`relative overflow-hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
            copied 
              ? 'bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399]'
              : 'bg-white/[0.02] border border-white/[0.04] text-[#666] hover:text-[#ededed] hover:bg-white/[0.05]'
          }`}
          title="Copy Prompt"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Check size={14} strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Copy size={14} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        </MagneticButton>
      </div>
      
      <div className="p-6 space-y-6 flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:100px_100px] [background-blend-mode:overlay] opacity-[0.98]">
        {/* Objective */}
        {item.objective && (
          <div>
            <h4 className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-2 flex items-center">
              <ChevronRight size={10} className="mr-1" /> Objective
            </h4>
            <p className="text-[13px] text-[#ededed] font-light leading-relaxed pl-3 border-l border-white/[0.05]">{item.objective}</p>
          </div>
        )}

        {/* Tasks */}
        {item.tasks.length > 0 && (
          <div>
            <h4 className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-3 flex items-center">
              <ChevronRight size={10} className="mr-1" /> Execution Tasks
            </h4>
            <ul className="space-y-2 pl-3">
              {item.tasks.map((task, i) => (
                <li key={i} className="flex items-start group/task">
                  <span className="text-[#34d399] mr-2 text-[10px] opacity-50 group-hover/task:opacity-100 transition-opacity mt-1">▹</span>
                  <span className="text-[13px] text-[#a1a1aa] font-light leading-relaxed">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prompt - The core element */}
        <div className="mt-4">
          <h4 className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-2 flex items-center">
            <ChevronRight size={10} className="mr-1" /> Payload
          </h4>
          <div className="bg-black/50 rounded-xl p-4 border border-white/[0.03] overflow-x-auto custom-scrollbar relative group/prompt">
            <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-white/[0.05] text-[#555] hover:text-[#34d399] transition-colors opacity-0 group-hover/prompt:opacity-100 border border-white/[0.05]">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            <pre className="font-mono text-[12px] leading-relaxed text-[#d4d4d4] whitespace-pre-wrap pr-6">
              {item.prompt}
            </pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-white/[0.03] pt-6">
          {/* Expected Files */}
          {item.files.length > 0 && (
            <div>
              <h4 className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-3 flex items-center">
                <ChevronRight size={10} className="mr-1" /> Architecture Targets
              </h4>
              <div className="space-y-1.5">
                {item.files.map((file, i) => (
                  <div key={i} className="flex flex-col p-2 bg-white/[0.02] rounded-lg border border-white/[0.02]">
                    <span className="text-[#ededed] text-[11px] font-mono truncate">{file.file}</span>
                    {file.purpose && <span className="text-[#666] text-[10px] truncate mt-0.5">{file.purpose}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification */}
          {item.verification && (
            <div>
              <h4 className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-3 flex items-center">
                <ChevronRight size={10} className="mr-1" /> Verification Test
              </h4>
              <div className="bg-black/50 p-2.5 rounded-lg border border-white/[0.03] overflow-x-auto custom-scrollbar">
                <code className="font-mono text-[11px] text-[#34d399] whitespace-pre-wrap">{item.verification}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PromptsContent() {
  const searchParams = useSearchParams()
  const viewId = searchParams.get('view')

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [plannerHistory, setPlannerHistory] = useState<PlannerVersion[]>([])
  const [selectedPlanner, setSelectedPlanner] = useState<PlannerVersion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prompts, setPrompts] = useState<ExtractedPrompt[]>([])

  // Move handleSelectProject definition before useEffect so it can be called
  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/planner/history?projectId=${project.id}`)
      if (res.ok) {
        const data = await res.json()
        setPlannerHistory(data)
        if (data && data.length > 0) {
          handleSelectPlanner(data[0]) // Select the latest plan automatically
        }
      } else {
        setPlannerHistory([])
      }
    } catch (e) {
      setPlannerHistory([])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (data && !error) {
        setProjects(data)
        if (viewId) {
          const p = data.find(p => p.id === viewId)
          if (p) handleSelectProject(p)
        }
      } else {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [viewId])

  const handleSelectPlanner = (planner: PlannerVersion) => {
    setSelectedPlanner(planner)
    const extracted = extractPrompts(planner.content)
    setPrompts(extracted)
  }

  return (
    <div className="flex flex-col h-screen w-full relative animate-fade-in bg-transparent">
      <NeuralMesh />
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-0" />
      
      <div className="flex-1 overflow-y-auto px-8 no-scrollbar relative z-10">
        <div className="max-w-5xl mx-auto pt-10 pb-20">

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#34d399]/10 text-[#34d399] px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4 border border-[#34d399]/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <Code2 size={12} />
              <span>Developer Assistant</span>
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-[#ededed] mb-3 flex items-center space-x-3">
              <span>Coding</span>
              <span className="text-[#34d399] drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                <GlitchText text="Prompts" speed={0.8} />
              </span>
            </h1>
            <p className="text-[#888] max-w-2xl text-[15px] leading-relaxed">
              Ready-to-use prompts extracted directly from your Next Step Planner. Simply click copy and paste into your favorite AI Agent.
            </p>
          </div>

          {!selectedProject ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Select a Project</h2>
              <p className="text-zinc-500 text-sm mb-6">
                Choose a project to view its extracted coding prompts.
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-2xl border border-zinc-800/50">
                  <Layers className="mx-auto mb-4 text-zinc-600" size={40} />
                  <p className="text-zinc-400 mb-2">No projects found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSelectProject(project)}
                      className={`group w-full text-left p-6 rounded-[24px] border transition-all duration-300 relative overflow-hidden hover:scale-[1.02] ${
                        selectedProject?.id === project.id
                          ? 'bg-[#34d399]/10 border-[#34d399]/40 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                          : 'bg-[#030303]/40 backdrop-blur-xl border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="absolute inset-0 rounded-[24px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                          <div className={`h-12 w-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ${
                            selectedProject?.id === project.id ? 'bg-[#34d399]/20 border-[#34d399]/50' : 'bg-[#111] border-[#222]'
                          }`}>
                            <Layers className={`${selectedProject?.id === project.id ? 'text-[#34d399]' : 'text-[#888]'}`} size={20} />
                          </div>
                          <div>
                            <h3 className="text-[#ededed] font-medium text-[15px] truncate max-w-[280px] tracking-tight">{project.name}</h3>
                            <p className="text-[#666] text-[10px] font-mono uppercase tracking-wider mt-1">PRD Object</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className={`transition-all duration-300 ${selectedProject?.id === project.id ? 'text-[#34d399] translate-x-1' : 'text-[#444] group-hover:text-[#ededed]'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <button
                    onClick={() => {
                      setSelectedProject(null)
                      setSelectedPlanner(null)
                      setPrompts([])
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline mb-2 block"
                  >
                    ← Back to Projects
                  </button>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedProject.name}</h2>
                  <p className="text-zinc-500 text-sm">
                    {plannerHistory.length} Planner Version{plannerHistory.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                {plannerHistory.length > 0 && selectedPlanner && (
                  <div className="flex items-center space-x-2">
                    {plannerHistory.length > 1 && (
                      <>
                        <span className="text-xs text-zinc-500 font-medium">Select Version:</span>
                        <select 
                          className="bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                          onChange={(e) => {
                            const planner = plannerHistory.find(p => p.id === e.target.value)
                            if (planner) handleSelectPlanner(planner)
                          }}
                          value={selectedPlanner?.id || ''}
                        >
                          {plannerHistory.map((plan, i) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.agent_name} - {new Date(plan.created_at).toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this planner history?')) {
                          try {
                            const res = await fetch(`/api/planner/history?id=${selectedPlanner.id}`, { method: 'DELETE' })
                            if (res.ok) {
                              if (selectedProject) handleSelectProject(selectedProject)
                            } else {
                              alert('Failed to delete planner history.')
                            }
                          } catch (err) {
                            alert('Error deleting planner history.')
                          }
                        }
                      }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                      title="Delete Plan"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {plannerHistory.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-2xl border border-zinc-800/50">
                  <Sparkles className="mx-auto mb-4 text-zinc-600" size={40} />
                  <p className="text-zinc-400 mb-2">No planner history found</p>
                  <p className="text-zinc-600 text-sm">Please generate a Next Step Planner first to see extracted prompts.</p>
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-2xl border border-zinc-800/50">
                  <Terminal className="mx-auto mb-4 text-zinc-600" size={40} />
                  <p className="text-zinc-400 mb-2">Could not extract prompts</p>
                  <p className="text-zinc-600 text-sm">The planner content might be in an unrecognized format.</p>
                </div>
              ) : (
                <div className="space-y-6 group/list relative">
                  {prompts.map((item, index) => (
                    <PromptCard key={index} index={index} item={item} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function PromptsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PromptsContent />
    </Suspense>
  )
}
