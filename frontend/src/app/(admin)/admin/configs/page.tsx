'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Key, Cpu, CheckCircle2, XCircle, Loader2, Save, 
  RefreshCw, ChevronDown, Sparkles, ShieldCheck, AlertTriangle,
  Eye, EyeOff, Zap, Activity, Info, Terminal
} from 'lucide-react'

interface ConfigData {
  id: string
  maskedApiKey: string
  modelId: string
  updatedAt: string
  isPlaceholder: boolean
}

interface Model {
  id: string
  label: string
  rpm: string
  note: string
}

export default function AiConfigPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [activeModel, setActiveModel] = useState<string>('gemini-3.1-flash-lite')
  const [usingEnvFallback, setUsingEnvFallback] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite')
  const [showKey, setShowKey] = useState(false)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)

  const [status, setStatus] = useState<{
    type: 'idle' | 'testing' | 'saving' | 'success' | 'error'
    message: string
  }>({ type: 'idle', message: '' })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/ai-config')
      const data = await res.json()
      setConfig(data.config)
      setModels(data.availableModels ?? [])
      setActiveModel(data.activeModel ?? 'gemini-3.1-flash-lite')
      setUsingEnvFallback(data.usingEnvFallback ?? true)
      setDbError(data.dbError ?? null)
      if (data.activeModel) setSelectedModel(data.activeModel)
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: 'ERROR: KEY_MISSING' })
      return
    }
    setStatus({ type: 'testing', message: 'INITIATING HANDSHAKE...' })
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, modelId: selectedModel, testOnly: true }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: 'success', message: `HANDSHAKE OK: [${selectedModel}] RESPONDED.` })
      } else {
        setStatus({ type: 'error', message: `FAIL: ${data.error}` })
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: `SYS_ERR: ${e.message}` })
    }
  }

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: 'ERROR: KEY_MISSING' })
      return
    }
    setStatus({ type: 'saving', message: 'VERIFYING KEY...' })
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, modelId: selectedModel, testOnly: false }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: 'success', message: 'CONFIG OVERWRITTEN. ROUTES UPDATED.' })
        setApiKey('')
        fetchConfig()
      } else {
        setStatus({ type: 'error', message: `WRITE_FAIL: ${data.error}` })
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: `SYS_ERR: ${e.message}` })
    }
  }

  const isBusy = status.type === 'testing' || status.type === 'saving'
  const selectedModelData = models.find(m => m.id === selectedModel)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6 pt-4 font-sans relative"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-10 border-b border-[#34d399]/20 pb-6 relative">
        <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-[#34d399] to-transparent" />
        <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-[#34d399]" />

        <div className="inline-flex items-center space-x-2 bg-[#34d399]/10 text-[#34d399] px-3 py-1 rounded-sm text-[10px] font-mono tracking-[0.2em] uppercase mb-4 border border-[#34d399]/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
          <Sparkles size={11} className="animate-pulse" />
          <span>AI Governance</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-[#ededed] mb-2 flex items-center">
          <Terminal className="mr-3 text-[#34d399] opacity-70" size={28} />
          AI CONFIGURATIONS
        </h1>
        <p className="text-[#888] font-mono text-[11px] uppercase tracking-widest mt-3">
          Configure the Google AI Studio pipeline for PRD generation and Next Step Planner.
        </p>
      </motion.div>

      {/* DB Migration Warning */}
      {dbError && (
        <motion.div
          variants={itemVariants}
          className="flex items-start space-x-3 p-5 rounded-none border border-amber-500/50 bg-amber-500/10 text-amber-400 text-[13px] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500"></div>
          <AlertTriangle size={15} className="mt-0.5 shrink-0 animate-pulse" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest mb-2 text-amber-300">SYS_WARN: DB Table Missing</p>
            <p className="text-amber-400/70 text-[12px] font-mono">
              Execute <code className="bg-amber-500/20 px-1 border border-amber-500/30">supabase/migrations/ai_config.sql</code> in Supabase SQL Editor.
            </p>
          </div>
        </motion.div>
      )}

      {/* Active Status Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-none border border-[#1e3a8a]/50 bg-[#020202] shadow-[inset_0_0_20px_rgba(30,58,138,0.1)] relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30"></div>

        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between relative z-20">
          <div className="flex items-center space-x-2">
            <Activity size={13} className={usingEnvFallback ? 'text-amber-400' : 'text-[#34d399]'} />
            <h2 className="text-[11px] font-mono text-[#888] uppercase tracking-[0.2em]">Active Configuration</h2>
          </div>
          <button onClick={fetchConfig} className="text-[#555] hover:text-blue-400 transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
        <div className="p-6 relative z-20">
          {isLoading ? (
            <div className="flex items-center space-x-3 text-blue-400 font-mono text-[11px] uppercase tracking-widest">
              <Loader2 size={14} className="animate-spin" />
              <span>Fetching...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-mono text-blue-400/70 uppercase tracking-[0.2em] mb-2">Status</p>
                {usingEnvFallback ? (
                  <span className="inline-flex items-center space-x-2 text-amber-400 text-[12px] font-mono uppercase tracking-wider bg-amber-400/10 px-2 py-1 border border-amber-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Env Fallback</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-2 text-[#34d399] text-[12px] font-mono uppercase tracking-wider bg-[#34d399]/10 px-2 py-1 border border-[#34d399]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                    <span>DB Config</span>
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-mono text-blue-400/70 uppercase tracking-[0.2em] mb-2">Active Model</p>
                <p className="text-[13px] font-mono text-blue-100">{activeModel}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-blue-400/70 uppercase tracking-[0.2em] mb-2">API Key</p>
                <p className="text-[13px] font-mono text-[#34d399] tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                  {config ? config.maskedApiKey : '(from .env)'}
                </p>
              </div>
              {config && (
                <div className="col-span-1 md:col-span-3 border-t border-white/[0.05] pt-5 mt-2 flex items-center">
                  <p className="text-[10px] font-mono text-[#555] uppercase tracking-[0.2em] mr-4">Last Updated</p>
                  <p className="text-[11px] font-mono text-[#888]">{new Date(config.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Update Configuration Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-none border border-[#581c87]/50 bg-[#020202] shadow-[inset_0_0_20px_rgba(88,28,135,0.1)] relative overflow-visible group z-30"
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30"></div>

        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center space-x-2 relative z-20">
          <Key size={13} className="text-[#888]" />
          <h2 className="text-[11px] font-mono text-[#888] uppercase tracking-[0.2em]">Overwrite Configuration</h2>
        </div>

        <div className="p-6 space-y-8 relative z-20">
          {/* API Key Input */}
          <div>
            <label className="block text-[10px] font-mono text-purple-400/70 uppercase tracking-[0.2em] mb-3 flex items-center">
              <span className="w-1.5 h-1.5 bg-purple-500 mr-2 rounded-sm"></span>
              Google AI Studio API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIza••••••••••••••••••••••••••••••••••••••"
                autoComplete="off"
                className="w-full bg-[#050505] border border-[#581c87]/50 rounded-none px-4 py-3.5 pr-12 text-[13px] font-mono text-purple-100 placeholder:text-[#444] focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all [&:-webkit-autofill]:!bg-[#050505] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#050505_inset] [&:-webkit-autofill]:!text-purple-100 [&:-webkit-autofill]:[-webkit-text-fill-color:#e9d5ff]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-purple-400 transition-colors"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="mt-3 text-[10px] font-mono text-[#555] tracking-widest uppercase">
              Retrieve Key: {' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                aistudio.google.com/apikey
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-[10px] font-mono text-purple-400/70 uppercase tracking-[0.2em] mb-3 flex items-center">
              <span className="w-1.5 h-1.5 bg-purple-500 mr-2 rounded-sm"></span>
              AI Compute Model
            </label>
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#050505] border border-[#581c87]/50 rounded-none px-4 py-3.5 text-[13px] font-mono text-purple-100 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Zap size={14} className="text-[#34d399] drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                  <span className="tracking-widest">{selectedModelData?.label ?? selectedModel}</span>
                  {selectedModel === activeModel && (
                    <span className="text-[9px] font-mono bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 px-2 py-0.5 ml-2 tracking-widest">
                      ACTIVE
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={`text-[#555] transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isModelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#080808] border border-[#581c87]/80 overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.2)] max-h-72 overflow-y-auto custom-scrollbar rounded-sm"
                  >
                    {models.length === 0 ? (
                      <div className="px-4 py-4 text-[11px] font-mono text-[#555] uppercase tracking-widest">LOADING DIRECTORY...</div>
                    ) : (
                      models.map(model => {
                        const isSelected = selectedModel === model.id
                        const isActive = activeModel === model.id
                        return (
                          <button
                            key={model.id}
                            onClick={() => { setSelectedModel(model.id); setIsModelDropdownOpen(false) }}
                            className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors border-b border-white/[0.03] last:border-0 ${
                              isSelected ? 'bg-purple-900/20' : 'hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-1">
                                <span className={`text-[12px] font-mono tracking-widest truncate ${isSelected ? 'text-purple-300' : 'text-[#ededed]'}`}>
                                  {model.label}
                                </span>
                                {isActive && (
                                  <span className="text-[8px] font-mono bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 px-1.5 py-0.5 tracking-widest">
                                    IN USE
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-[#555] tracking-widest uppercase">{model.note}</p>
                            </div>
                            <div className="flex items-center space-x-4 ml-4 shrink-0">
                              <span className="text-[10px] font-mono text-[#555] tracking-[0.2em]">RPM {model.rpm}</span>
                              <div className="w-4 h-4 flex items-center justify-center">
                                {isSelected && <CheckCircle2 size={14} className="text-purple-400" />}
                              </div>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status Banner */}
          <AnimatePresence mode="wait">
            {status.type !== 'idle' && (
              <motion.div
                key={status.type + status.message}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className={`flex items-start space-x-3 p-4 border text-[11px] font-mono uppercase tracking-widest ${
                  status.type === 'success'
                    ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.1)]'
                    : status.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                }`}>
                  {status.type === 'success' && <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}
                  {status.type === 'error' && <XCircle size={15} className="mt-0.5 shrink-0" />}
                  {(status.type === 'testing' || status.type === 'saving') && (
                    <Loader2 size={15} className="mt-0.5 shrink-0 animate-spin" />
                  )}
                  <span>{status.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t border-white/[0.05]">
            <button
              onClick={handleTest}
              disabled={isBusy}
              className="flex items-center justify-center space-x-2 w-48 py-3 bg-[#050505] border border-[#581c87]/50 text-purple-400 hover:bg-purple-900/20 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[11px] font-mono uppercase tracking-[0.2em]"
            >
              <ShieldCheck size={14} />
              <span>TEST LINK</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isBusy}
              className="flex items-center justify-center space-x-2 flex-1 py-3 bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[11px] font-mono uppercase tracking-[0.2em] relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              {isBusy ? <Loader2 size={14} className="animate-spin relative z-10" /> : <Save size={14} className="relative z-10" />}
              <span className="relative z-10">{status.type === 'saving' ? 'EXECUTING...' : 'COMMIT CHANGES'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-none border border-[#065f46]/50 bg-[#020202] p-6 space-y-4 shadow-[inset_0_0_20px_rgba(6,95,70,0.1)] relative"
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#34d399]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#34d399]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30"></div>
        
        <h3 className="text-[10px] font-mono text-[#34d399] uppercase tracking-[0.2em] flex items-center space-x-2 relative z-20">
          <Info size={13} />
          <span>System Protocol</span>
        </h3>
        <ul className="space-y-3 text-[11px] font-mono text-[#888] tracking-widest relative z-20">
          <li className="flex items-start space-x-3">
            <span className="text-[#34d399] mt-px opacity-70">[1]</span>
            <span>Handshake validation is required before committing to DB.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-[#34d399] mt-px opacity-70">[2]</span>
            <span>Hot-swap enabled. Zero-downtime cache invalidation.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-[#34d399] mt-px opacity-70">[3]</span>
            <span>Fallback sequence: Database → <code className="text-blue-400">.env</code> keys.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-[#34d399] mt-px opacity-70">[4]</span>
            <span className="text-[#888]">Database schema <code className="bg-white/5 px-1 border border-white/10 text-purple-400">ai_config.sql</code> is required for initial boot.</span>
          </li>
        </ul>
      </motion.div>

    </motion.div>
  )
}
