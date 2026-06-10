'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Sparkles, StopCircle, Download, CheckCircle2, 
  Circle, ChevronRight, Cpu, Zap, Shield, Bot, 
  Terminal, Code2, Layers, Rocket, ArrowRight, History, Clock, Atom
} from 'lucide-react'
import { useCompletion } from '@ai-sdk/react'
import { PRDViewer } from '@/components/ui/PRDViewer'
import { createClient } from '@/utils/supabase/client'
import { GlitchText } from '@/components/ui/GlitchText'
import { NeuralMesh } from '@/components/ui/NeuralMesh'

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

const AGENTS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    company: 'Anthropic',
    icon: Terminal,
    color: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    description: 'CLI-based agentic coding. Best for large refactors & complex debugging.',
    strengths: ['Multi-file editing', 'Terminal commands', 'CLAUDE.md context'],
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    company: 'Google DeepMind',
    icon: Atom,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    description: 'IDE-integrated agent with planning mode, subagents & background tasks.',
    strengths: ['Planning mode', 'Background tasks', 'Full-stack'],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    company: 'Microsoft',
    icon: Code2,
    color: 'from-emerald-500 to-green-500',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    description: 'Inline completions & Copilot Workspace for multi-file changes.',
    strengths: ['Inline suggestions', '@workspace context', 'Copilot Workspace'],
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    company: 'OpenAI',
    icon: Bot,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-500/30',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-400',
    description: 'CLI agent with sandboxed execution. Auto-edit and full-auto modes.',
    strengths: ['Sandboxed execution', 'Auto-edit mode', 'codex.md context'],
  },
  {
    id: 'kiro',
    name: 'Kiro',
    company: 'Amazon',
    icon: Layers,
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400',
    description: 'Spec-Driven Development with automated requirement specs & hooks.',
    strengths: ['Spec-driven', 'AWS integration', 'Steering hooks'],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    company: 'Anysphere',
    icon: Cpu,
    color: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-500/30',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-400',
    description: 'VS Code fork with Composer for multi-file editing & Agent Mode.',
    strengths: ['Composer', '.cursorrules', 'Agent Mode'],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    company: 'Codeium',
    icon: Rocket,
    color: 'from-teal-500 to-cyan-500',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-400',
    description: 'AI-native IDE with Cascade autonomous agent & Flows system.',
    strengths: ['Cascade agent', 'Deep codebase understanding', 'Supercomplete'],
  },
]

const PHASES = [
  { icon: '📋', name: 'Pre-Flight', phase: 0 },
  { icon: '🏗️', name: 'Init & Arch', phase: 1 },
  { icon: '🗄️', name: 'Database', phase: 2 },
  { icon: '🎨', name: 'Frontend', phase: 3 },
  { icon: '⚡', name: 'Features', phase: 4 },
  { icon: '🔌', name: 'API Layer', phase: 5 },
  { icon: '🛡️', name: 'Security', phase: 6 },
  { icon: '🧪', name: 'Testing', phase: 7 },
  { icon: '🚀', name: 'CI/CD', phase: 8 },
  { icon: '🌐', name: 'Deploy', phase: 9 },
  { icon: '📊', name: 'Monitoring', phase: 10 },
  { icon: '📝', name: 'Docs', phase: 11 },
  { icon: '✅', name: 'Launch', phase: 12 },
]

export default function PlannerPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [plannerHistory, setPlannerHistory] = useState<PlannerVersion[]>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PlannerVersion | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [step, setStep] = useState<'select-project' | 'select-agent' | 'history' | 'generating' | 'viewing-history'>('select-project')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Fetch user's projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (data && !error) {
        setProjects(data)
        
        // Auto-select if ?view=id is present in URL
        const params = new URLSearchParams(window.location.search)
        const viewId = params.get('view')
        if (viewId) {
          const proj = data.find((p: any) => p.id === viewId)
          if (proj) {
            handleSelectProject(proj)
          }
        }
      }
      setIsLoadingProjects(false)
    }
    fetchProjects()
  }, [])

  const fetchPlannerHistory = async (projectId: string) => {
    setIsLoadingHistory(true)
    try {
      const res = await fetch(`/api/planner/history?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setPlannerHistory(data)
      } else {
        setPlannerHistory([])
      }
    } catch (e) {
      setPlannerHistory([])
    }
    setIsLoadingHistory(false)
  }

  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project)
    setStep('history')
    await fetchPlannerHistory(project.id)
  }

  const { completion, isLoading, stop, complete } = useCompletion({
    api: '/api/planner',
    streamProtocol: 'text',
    onError: (error) => {
      console.error('Planner error:', error)
      alert(`Error: ${error.message}`)
    },
    onFinish: () => {
      // Refresh history after generating
      if (selectedProject) {
        fetchPlannerHistory(selectedProject.id)
      }
    }
  })

  // Auto scroll during generation
  useEffect(() => {
    if (isLoading && bottomRef.current) {
      bottomRef.current.scrollIntoView()
    }
  }, [completion, isLoading])

  // Count completed phases from the stream output
  const completedPhases = useMemo(() => {
    if (!completion) return 0
    const phaseMatches = completion.match(/Phase [0-9]+|Final Checklist/g)
    return phaseMatches ? phaseMatches.length : 0
  }, [completion])

  const handleGenerate = async () => {
    if (!selectedProject || !selectedAgent) return
    
    setStep('generating')

    // Fetch the latest PRD content for the selected project
    const supabase = createClient()
    const { data: prdData, error: prdError } = await supabase
      .from('prd_versions')
      .select('content')
      .eq('project_id', selectedProject.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    if (prdError || !prdData) {
      alert('Could not load PRD content for this project. Please generate a PRD first.')
      setStep('select-agent')
      return
    }

    complete('', {
      body: {
        prdContent: prdData.content,
        selectedAgent: selectedAgent,
        projectName: selectedProject.name,
        projectId: selectedProject.id,
      }
    })
  }

  const handleDownloadMd = (content: string, agentName: string) => {
    if (!content) return
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedProject?.name || 'plan'}_${agentName}_implementation_plan.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedAgentData = AGENTS.find(a => a.id === selectedAgent)

  return (
    <div className="flex flex-col h-screen w-full relative animate-fade-in bg-transparent">
      <NeuralMesh />
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-0" />
      
      <div className="flex-1 overflow-y-auto px-8 no-scrollbar relative z-10">
        <div className="max-w-5xl mx-auto pt-10 pb-8">

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#34d399]/10 text-[#34d399] px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4 border border-[#34d399]/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <Sparkles size={12} />
              <span>AI Implementation</span>
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-[#ededed] mb-3 flex items-center space-x-3">
              <span>Next Step</span>
              <span className="text-[#34d399] drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                <GlitchText text="Planner" speed={0.8} />
              </span>
            </h1>
            <p className="text-[#888] max-w-2xl text-[15px] leading-relaxed">
              Transform your PRD into an actionable, step-by-step implementation plan optimized for your favorite AI coding agent.
            </p>
          </div>

          {/* Step Indicator (Terminal Sequence) */}
          {step !== 'generating' && step !== 'viewing-history' && (
            <div className="flex items-center space-x-4 mb-10 font-mono text-[11px] tracking-[0.2em] uppercase max-w-2xl">
              {/* Step 1 */}
              <button 
                onClick={() => step !== 'select-project' && setStep('select-project')}
                className={`flex items-center transition-all duration-300 ${step === 'select-project' ? 'text-[#34d399] drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'text-[#555] hover:text-[#888]'}`}
              >
                [ 01_SELECT_PROJECT ]
              </button>
              
              <div className={`flex-1 h-[1px] transition-all duration-500 ${step === 'history' || step === 'select-agent' ? 'bg-gradient-to-r from-[#34d399] to-[#34d399]/20 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-white/[0.05]'}`} />
              
              {/* Step 2 */}
              <div className={`flex items-center transition-all duration-300 ${step === 'history' || step === 'select-agent' ? 'text-[#34d399] drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : step === 'select-project' ? 'text-[#333]' : 'text-[#555]'}`}>
                [ 02_CHOOSE_PATH ]
              </div>
              
              <div className={`flex-1 h-[1px] bg-white/[0.05]`} />
              
              {/* Step 3 */}
              <div className="flex items-center text-[#333]">
                [ 03_GENERATE ]
              </div>
            </div>
          )}

          {/* Step 1: Select Project */}
          <AnimatePresence mode="wait">
            {step === 'select-project' && (
              <motion.div
                key="select-project"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">Select a PRD Project</h2>
                <p className="text-zinc-500 text-sm mb-6">
                  Choose which project's PRD you want to transform into an implementation plan.
                </p>

                {isLoadingProjects ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-16 bg-[#111] rounded-2xl border border-zinc-800/50">
                    <Sparkles className="mx-auto mb-4 text-zinc-600" size={40} />
                    <p className="text-zinc-400 mb-2">No PRD projects found</p>
                    <p className="text-zinc-600 text-sm">Generate a PRD first to use the Next Step Planner.</p>
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
                          <ArrowRight size={18} className={`transition-all duration-300 ${selectedProject?.id === project.id ? 'text-[#34d399] translate-x-1' : 'text-[#444] group-hover:text-[#ededed] group-hover:-rotate-45'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2a: View History or Create New */}
            {step === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-sans font-bold tracking-tight text-[#ededed] mb-1 flex items-center">
                      <History className="mr-3 text-purple-400 opacity-80" size={24} />
                      Project History
                    </h2>
                    <p className="text-[#888] font-mono text-[11px] uppercase tracking-widest mt-1">
                      Target_Project: <span className="text-purple-400 font-bold">[{selectedProject?.name}]</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('select-agent')}
                    className="group relative flex items-center space-x-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-6 py-3 text-[11px] font-mono uppercase tracking-widest border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)] overflow-hidden"
                  >
                    <div className="absolute inset-0 w-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 group-hover:w-full transition-all duration-700 ease-out translate-x-[-100%] group-hover:translate-x-[100%]" />
                    <Sparkles size={14} className="group-hover:animate-pulse text-purple-400" />
                    <span className="relative z-10">Generate_New_Plan</span>
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-purple-400 opacity-50" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-purple-400 opacity-50" />
                  </button>
                </div>

                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-2 mb-4">
                        <div className="w-1.5 h-8 bg-white/10 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-12 bg-[#34d399]/40 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-[10px] font-mono text-[#555] uppercase tracking-[0.2em]">Synthesizing</span>
                    </div>
                  </div>
                ) : plannerHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-white/[0.05] rounded-[32px] bg-[#030303]">
                    <div className="w-24 h-24 mb-6 relative opacity-20">
                      {/* Geometric SVG Empty State */}
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" />
                        <path d="M20 20L80 80M80 20L20 80" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </div>
                    <p className="text-[#ededed] font-medium text-lg mb-2">The architecture is silent.</p>
                    <p className="text-[#666] text-sm mb-8 font-light text-center max-w-md">Initialize an implementation plan to bring structure to this project.</p>
                    <button
                      onClick={() => setStep('select-agent')}
                      className="group flex items-center space-x-2 bg-white/[0.03] hover:bg-[#34d399]/10 text-[#ededed] hover:text-[#34d399] px-6 py-3 rounded-2xl text-[13px] font-medium border border-white/[0.05] hover:border-[#34d399]/30 transition-all duration-300"
                    >
                      <span>Awaken Agent</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="flex overflow-x-auto gap-4 pb-6 custom-scrollbar snap-x w-full">
                    {plannerHistory.map((history) => {
                      const agentData = AGENTS.find(a => a.id === history.agent_name) || AGENTS[0]
                      const Icon = agentData.icon
                      const date = new Date(history.created_at)
                      return (
                        <div
                          key={history.id}
                          className="group relative flex-none w-[320px] h-[220px] border border-white/[0.05] hover:border-purple-500/30 bg-[#020202] transition-all duration-500 snap-start overflow-hidden flex flex-col justify-between shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
                        >
                          {/* HUD Crosshairs */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-purple-500 transition-colors z-10" />
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-purple-500 transition-colors z-10" />
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-purple-500 transition-colors z-10" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-purple-500 transition-colors z-10" />

                          {/* Animated Barcode Background */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-24 flex gap-1 opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="h-full bg-white w-1"
                                animate={{ height: ['20%', '100%', '40%', '80%', '20%'] }}
                                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: 'linear' }}
                              />
                            ))}
                          </div>

                          {/* Scanner Line */}
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 opacity-0 group-hover:opacity-100 z-10 shadow-[0_0_8px_rgba(168,85,247,0.8)] pointer-events-none" />

                          <button
                            onClick={() => {
                              setSelectedHistoryItem(history)
                              setStep('viewing-history')
                            }}
                            className="flex-1 flex flex-col items-start text-left p-6 w-full h-full relative z-20"
                          >
                            <div className="flex items-center justify-between w-full mb-8">
                              <div className={`relative h-12 w-12 rounded-2xl border border-white/5 bg-black/40 flex items-center justify-center group-hover:scale-110 group-hover:border-white/10 transition-all duration-500 overflow-hidden backdrop-blur-md shadow-2xl`}>
                                {/* Ambient background glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${agentData.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500 mix-blend-screen blur-[2px]`}></div>
                                {/* Inner shadow & glassy edge */}
                                <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] z-0 rounded-2xl pointer-events-none"></div>
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                {/* The Icon */}
                                <Icon className={`relative z-10 ${agentData.textColor} drop-shadow-[0_0_10px_currentColor] group-hover:text-white transition-colors duration-300`} size={24} strokeWidth={1.5} />
                              </div>
                            </div>
                            
                            <div className="mt-auto w-full">
                              <p className="text-[#555] text-[9px] font-mono uppercase tracking-[0.3em] mb-1.5">Agent_Identity</p>
                              <h3 className="text-[#ededed] font-medium text-xl flex items-center tracking-tight mb-4 w-full">
                                <GlitchText text={agentData.name} delay={Math.random() * 1000} speed={0.5} />
                              </h3>
                              <div className="flex items-center space-x-2 text-[#888] text-[9px] font-mono tracking-widest bg-white/[0.02] px-2 py-1.5 border border-white/[0.05] w-full overflow-hidden">
                                <Clock size={10} className="text-purple-400/70 shrink-0" />
                                <span className="truncate">{`TS:${date.toISOString().split('T')[0].replace(/-/g, '.')}//${date.toTimeString().split(' ')[0]}Z`}</span>
                              </div>
                            </div>
                          </button>
                          
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this planner history?')) {
                                try {
                                  const res = await fetch(`/api/planner/history?id=${history.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    if (selectedProject) fetchPlannerHistory(selectedProject.id);
                                  } else {
                                    alert('Failed to delete planner history.');
                                  }
                                } catch (err) {
                                  alert('Error deleting planner history.');
                                }
                              }
                            }}
                            className="absolute right-4 top-4 p-2 text-[#444] hover:text-red-400 bg-[#000]/50 hover:bg-red-400/10 border border-transparent hover:border-red-400/30 transition-all z-30 opacity-0 group-hover:opacity-100 backdrop-blur-md"
                            title="Delete Record"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2b: Select Agent */}
            {step === 'select-agent' && (
              <motion.div
                key="select-agent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Choose Your AI Coding Agent</h2>
                    <p className="text-zinc-500 text-sm">
                      Project: <span className="text-purple-400 font-medium">{selectedProject?.name}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('history')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline"
                  >
                    Back to History
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {AGENTS.map((agent) => {
                    const Icon = agent.icon
                    const isSelected = selectedAgent === agent.id
                    return (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`group text-left p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                          isSelected
                            ? `${agent.bgColor} ${agent.borderColor} shadow-lg`
                            : 'bg-[#111] border-zinc-800/50 hover:border-zinc-700 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`relative h-12 w-12 rounded-2xl border ${isSelected ? agent.borderColor : 'border-white/5'} bg-black/40 flex items-center justify-center group-hover:scale-110 transition-all duration-500 overflow-hidden backdrop-blur-md shadow-lg shrink-0`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} ${isSelected ? 'opacity-30' : 'opacity-10'} group-hover:opacity-30 transition-opacity duration-500 mix-blend-screen blur-[2px]`}></div>
                            <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] z-0 rounded-2xl pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            <Icon className={`relative z-10 ${isSelected ? 'text-white' : agent.textColor} drop-shadow-[0_0_10px_currentColor] transition-colors duration-300`} size={22} strokeWidth={1.5} />
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? `${agent.borderColor} ${agent.bgColor}` : 'border-zinc-700'
                          }`}>
                            {isSelected && <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${agent.color}`} />}
                          </div>
                        </div>
                        <h3 className="text-white font-bold text-sm mb-0.5">{agent.name}</h3>
                        <p className="text-zinc-600 text-[11px] font-medium uppercase tracking-wider mb-2">{agent.company}</p>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3">{agent.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.strengths.map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-zinc-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedAgent}
                    className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                      selectedAgent
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-105'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Rocket size={18} className={selectedAgent ? 'group-hover:animate-bounce' : ''} />
                    <span>Generate Implementation Plan</span>
                    {selectedAgent && <ArrowRight size={16} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Viewing History */}
            {step === 'viewing-history' && selectedHistoryItem && (
              <motion.div
                key="viewing-history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <button
                      onClick={() => setStep('history')}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline mb-2 block"
                    >
                      ← Back to History
                    </button>
                    <div className="flex items-center space-x-3 mb-2">
                      {(() => {
                        const agentData = AGENTS.find(a => a.id === selectedHistoryItem.agent_name) || AGENTS[0]
                        const Icon = agentData.icon
                        return (
                          <>
                            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${agentData.color} flex items-center justify-center`}>
                              <Icon className="text-white" size={16} />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-white">Saved Implementation Plan</h2>
                              <p className="text-zinc-500 text-xs">
                                {selectedProject?.name} → {agentData.name} ({new Date(selectedHistoryItem.created_at).toLocaleDateString()})
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadMd(selectedHistoryItem.content, selectedHistoryItem.agent_name)}
                      className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                    >
                      <Download size={14} />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>

                <PRDViewer content={selectedHistoryItem.content} />
              </motion.div>
            )}

            {/* Step 3: Generating Result */}
            {step === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Generation Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <button
                      onClick={() => setStep('history')}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline mb-2 block"
                    >
                      ← Back to History
                    </button>
                    <div className="flex items-center space-x-3 mb-2">
                      {selectedAgentData && (
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${selectedAgentData.color} flex items-center justify-center`}>
                          <selectedAgentData.icon className="text-white" size={16} />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-white">Generating Plan...</h2>
                        <p className="text-zinc-500 text-xs">
                          {selectedProject?.name} → {selectedAgentData?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isLoading && (
                      <button
                        onClick={stop}
                        className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-medium border border-red-500/20 transition-colors"
                      >
                        <StopCircle size={14} />
                        <span>Stop</span>
                      </button>
                    )}
                    {!isLoading && completion && (
                      <button
                        onClick={() => handleDownloadMd(completion, selectedAgent || 'plan')}
                        className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                      >
                        <Download size={14} />
                        <span>Download .md</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Phase Progress Bar */}
                <div className="mb-6 bg-[#111] rounded-2xl border border-zinc-800/50 p-4 overflow-x-auto no-scrollbar">
                  <div className="flex items-center space-x-1 min-w-max">
                    {PHASES.map((phase, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                          index < completedPhases
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : index === completedPhases && isLoading
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse'
                              : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                        }`}>
                          <span>{phase.icon}</span>
                          <span className="hidden lg:inline">{phase.name}</span>
                        </div>
                        {index < PHASES.length - 1 && (
                          <div className={`h-[2px] w-3 mx-0.5 rounded ${
                            index < completedPhases ? 'bg-emerald-500/40' : 'bg-zinc-800'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loading Indicator */}
                {isLoading && !completion && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-purple-400" size={20} />
                      </div>
                    </div>
                    <p className="text-white font-medium mb-1">Analyzing your PRD...</p>
                    <p className="text-zinc-500 text-sm">Crafting a step-by-step plan for {selectedAgentData?.name}</p>
                  </div>
                )}

                {/* Rendered Plan */}
                {completion && (
                  <PRDViewer content={completion} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} className="h-8" />
        </div>
      </div>

      {/* Footer Watermark */}
      <div className="py-3 text-center border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-sm">
        <span className="text-[11px] text-zinc-600">
          Amvibe Next Step Planner · Powered by Gemini 3.1 Flash Lite
        </span>
      </div>
    </div>
  )
}
