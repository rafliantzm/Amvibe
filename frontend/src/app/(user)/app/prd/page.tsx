'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { Send, FileText, Settings2, Plus, StopCircle, List, Download, Printer, Trash2 } from 'lucide-react'
import { useCompletion } from '@ai-sdk/react'
import { PRDViewer } from '@/components/ui/PRDViewer'
import { createClient } from '@/utils/supabase/client'
import { NeuralMesh } from '@/components/ui/NeuralMesh'

export default function PRDPage() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setCompletion,
    setInput,
  } = useCompletion({
    api: '/api/prd',
    streamProtocol: 'text',
    onFinish: () => {
      // Once generation finishes, wait a brief moment for the server-side onFinish 
      // to commit the new project to Supabase, then fetch the latest project and redirect to it.
      setTimeout(async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('projects')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (data && !error) {
            // Hard redirect to bust cache and update sidebar history
            window.location.href = `/app/prd/${data.id}`;
          }
        } catch (e) {
          console.error('Failed to redirect to new project', e);
        }
      }, 1500); // 1.5s delay to ensure DB transaction is complete
    }
  })
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tocRef = useRef<HTMLDivElement>(null)
  const [isTocOpen, setIsTocOpen] = useState(false)
  const visibleContent = completion || ''
  const headings = useMemo(() => {
    const regex = /^(#{1,3})\s+(.+)$/gm
    const matches: Array<{ id: string; level: number; text: string }> = []
    let match: RegExpExecArray | null

    while ((match = regex.exec(visibleContent)) !== null) {
      matches.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      })
    }

    return matches
  }, [visibleContent])

  // Auto-scroll to bottom as content generates
  useEffect(() => {
    if (completion && bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: 'end' })
    }
  }, [completion])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setIsTocOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCardClick = (promptText: string) => {
    setInput(promptText)
  }

  const handleDownloadMd = () => {
    if (!visibleContent) return

    const blob = new Blob([visibleContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `amvibe-prd-draft-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrintPdf = () => {
    if (!visibleContent) return
    window.print()
  }

  const handleJumpToHeading = (id: string) => {
    setIsTocOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleClearDraft = () => {
    setCompletion('')
    setInput('')
    setIsTocOpen(false)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e)
    setInput('')
  }

  return (
    <div className="flex flex-col h-screen w-full relative animate-fade-in bg-transparent">
      <NeuralMesh />
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-0" />
      
      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-8 no-scrollbar pt-10 relative z-10">
        <div className="max-w-5xl mx-auto">
        
        {/* Show Welcome & Empty States only if no completion exists */}
        {!completion && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-32 h-32 mb-8 relative opacity-20">
              {/* Geometric SVG Empty State */}
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                <path d="M10 50H90" stroke="currentColor" strokeWidth="1" />
                <path d="M50 10V90" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-[56px] font-bold tracking-tighter text-[#ededed] mb-4 text-center leading-[1.1]">
              Architect your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] to-emerald-700">Vision</span>
            </h1>
            <p className="text-[#666] font-light max-w-xl text-center text-[15px] mb-12">
              The canvas is blank. Describe the parameters of your application, and Amvibe AI will synthesize a production-grade specification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <div 
                onClick={() => handleCardClick("Build a PRD for a modern e-commerce platform focusing on sneakers with AR try-on features and social sharing.")}
                className="p-6 rounded-[24px] bg-[#050505] border border-white/[0.04] hover:border-white/[0.1] hover:bg-[#0a0a0a] transition-all duration-300 cursor-pointer group shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
              >
                <h3 className="text-[#ededed] font-medium text-sm mb-2 flex items-center tracking-tight">
                  <FileText size={16} className="mr-2 text-[#555] group-hover:text-[#34d399] transition-colors" /> 
                  E-Commerce Architecture
                </h3>
                <p className="text-[13px] text-[#888] font-light">&quot;Build a PRD for a modern e-commerce platform focusing on sneakers with AR try-on features and social sharing.&quot;</p>
              </div>
              <div 
                onClick={() => handleCardClick("Create a specification document for an AI-powered CRM designed specifically for real estate agents.")}
                className="p-6 rounded-[24px] bg-[#050505] border border-white/[0.04] hover:border-white/[0.1] hover:bg-[#0a0a0a] transition-all duration-300 cursor-pointer group shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
              >
                <h3 className="text-[#ededed] font-medium text-sm mb-2 flex items-center tracking-tight">
                  <Settings2 size={16} className="mr-2 text-[#555] group-hover:text-[#34d399] transition-colors" /> 
                  SaaS CRM Engine
                </h3>
                <p className="text-[13px] text-[#888] font-light">&quot;Create a specification document for an AI-powered CRM designed specifically for real estate agents.&quot;</p>
              </div>
            </div>
          </div>
        ) : (
          /* Render Markdown Result */
          <div className="w-full relative">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-[28px] font-bold text-white mb-1 leading-tight tracking-tight">Drafting PRD...</h1>
                <p className="text-zinc-500 text-sm truncate max-w-xl">{visibleContent.slice(0, 80).replace(/[#*`\n]/g, '')}...</p>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center space-x-2 shrink-0">
                <div className="relative" ref={tocRef}>
                  <button
                    type="button"
                    onClick={() => setIsTocOpen((open) => !open)}
                    disabled={headings.length === 0}
                    className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                  >
                    <List size={14} /> <span>ToC</span>
                  </button>

                  {isTocOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 rounded-xl border border-zinc-800 bg-[#111] p-2 shadow-2xl z-50">
                      <div className="max-h-80 overflow-y-auto space-y-1">
                        {headings.map((heading) => (
                          <button
                            key={heading.id}
                            type="button"
                            onClick={() => handleJumpToHeading(heading.id)}
                            className={`block w-full rounded-lg px-3 py-2 text-left text-[12px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors ${
                              heading.level === 1 ? 'font-bold text-white' : heading.level === 2 ? 'pl-4' : 'pl-6'
                            }`}
                          >
                            {heading.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>

                <button
                  type="button"
                  onClick={handleDownloadMd}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                >
                  <Download size={14} /> <span>.md</span>
                </button>
                
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                >
                  <Printer size={14} /> <span>PDF</span>
                </button>

                <button 
                  type="button"
                  onClick={handleClearDraft}
                  className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-medium border border-red-500/20 transition-colors ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div ref={contentRef}>
              <PRDViewer content={visibleContent || '*Generating PRD...*'} />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Input Area (Flex Footer) */}
      <div className="pt-2 pb-6 px-4 md:px-8 relative z-20">
        <div className="relative max-w-3xl mx-auto group">
          {/* Animated Glow effect behind input */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-[#34d399]/30 via-purple-500/30 to-[#34d399]/30 rounded-[32px] blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 animate-[pulse_4s_ease-in-out_infinite]"></div>
          
          <form onSubmit={onSubmit} className="relative bg-[#050505]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-2 flex items-end shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 focus-within:border-white/[0.15] focus-within:bg-[#0a0a0a]/90">
            <button type="button" className="p-3.5 text-[#666] hover:text-[#ededed] hover:bg-white/[0.05] rounded-full transition-all shrink-0 mb-1 ml-1 group/btn" title="Add context">
              <Plus size={22} className="transition-transform duration-300 group-hover/btn:rotate-90" />
            </button>
            
            <textarea 
              value={input}
              onChange={handleInputChange}
              placeholder="Jelaskan aplikasi yang ingin Anda bangun secara detail..."
              className="flex-1 bg-transparent text-[#ededed] placeholder-[#555] border-none outline-none resize-none px-4 py-4 max-h-[200px] min-h-[60px] text-[15px] leading-relaxed no-scrollbar"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim()) {
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
                    setInput('')
                  }
                }
              }}
            />
            
            {isLoading ? (
              <button 
                type="button" 
                onClick={stop}
                className="p-3.5 rounded-full transition-all shrink-0 mb-1 mr-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center"
              >
                <StopCircle size={22} className="animate-pulse" />
              </button>
            ) : (
              <button 
                type="submit" 
                suppressHydrationWarning
                disabled={!input.trim()}
                className={`p-3.5 rounded-full transition-all duration-300 shrink-0 mb-1 mr-1 relative flex items-center justify-center overflow-hidden ${
                  input.trim() 
                    ? 'bg-[#34d399] text-[#020202] shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-100 hover:scale-105' 
                    : 'bg-white/[0.03] text-[#444] cursor-not-allowed scale-95'
                }`}
              >
                {input.trim() && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
                )}
                <Send size={20} className={`relative z-10 transition-transform duration-300 ${input.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
              </button>
            )}
          </form>
          <div className="mt-3 px-4 pb-1 text-center md:mt-4 md:px-0">
            <span className="mx-auto block max-w-[340px] text-[11px] font-mono uppercase tracking-[0.18em] leading-relaxed text-[#696969] md:max-w-none md:text-[10px] md:tracking-widest md:text-[#555]">
              <span className="block md:inline">Powered by Gemini 3.1 Flash Lite</span>
              <span className="hidden opacity-40 md:mx-2 md:inline">|</span>
              <span className="mt-1 block opacity-80 md:mt-0 md:inline md:opacity-60">Harap tinjau ulang hasil PRD</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
