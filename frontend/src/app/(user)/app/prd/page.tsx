'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, FileText, Settings2, Plus, StopCircle, List, Download, Printer, Trash2 } from 'lucide-react'
import { useCompletion } from '@ai-sdk/react'
import { PRDViewer } from '@/components/ui/PRDViewer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { NeuralMesh } from '@/components/ui/NeuralMesh'

export default function PRDPage() {
  const router = useRouter()

  const { completion, input, handleInputChange, handleSubmit, isLoading, stop, setInput } = useCompletion({
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

  // Auto-scroll to bottom as content generates
  useEffect(() => {
    if (completion && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [completion])

  const handleCardClick = (promptText: string) => {
    setInput(promptText)
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
                <p className="text-[13px] text-[#888] font-light">"Build a PRD for a modern e-commerce platform focusing on sneakers with AR try-on features and social sharing."</p>
              </div>
              <div 
                onClick={() => handleCardClick("Create a specification document for an AI-powered CRM designed specifically for real estate agents.")}
                className="p-6 rounded-[24px] bg-[#050505] border border-white/[0.04] hover:border-white/[0.1] hover:bg-[#0a0a0a] transition-all duration-300 cursor-pointer group shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
              >
                <h3 className="text-[#ededed] font-medium text-sm mb-2 flex items-center tracking-tight">
                  <Settings2 size={16} className="mr-2 text-[#555] group-hover:text-[#34d399] transition-colors" /> 
                  SaaS CRM Engine
                </h3>
                <p className="text-[13px] text-[#888] font-light">"Create a specification document for an AI-powered CRM designed specifically for real estate agents."</p>
              </div>
            </div>
          </div>
        ) : (
          /* Render Markdown Result */
          <div className="w-full relative">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-[28px] font-bold text-white mb-1 leading-tight tracking-tight">Drafting PRD...</h1>
                <p className="text-zinc-500 text-sm truncate max-w-xl">{completion.slice(0, 80).replace(/[#*`\n]/g, '')}...</p>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center space-x-2 shrink-0">
                <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors">
                  <List size={14} /> <span>ToC</span>
                </button>
                
                <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>

                <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors">
                  <Download size={14} /> <span>.md</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors">
                  <Printer size={14} /> <span>PDF</span>
                </button>

                <button 
                  onClick={() => setInput('')}
                  className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-medium border border-red-500/20 transition-colors ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <PRDViewer content={completion || '*Generating PRD...*'} />
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Input Area (Flex Footer) */}
      <div className="pt-4 pb-4 px-8 relative z-10">
        <div className="relative max-w-4xl mx-auto">
          {/* Glow effect behind input */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <form onSubmit={onSubmit} className="relative bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-end shadow-2xl">
            <button type="button" className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 mb-1">
              <Plus size={20} />
            </button>
            
            <textarea 
              value={input}
              onChange={handleInputChange}
              placeholder="Jelaskan aplikasi yang ingin Anda bangun secara detail..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 border-none outline-none resize-none px-3 py-4 max-h-48 min-h-[56px] text-base leading-relaxed no-scrollbar"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
                  setInput('')
                }
              }}
            />
            
            {isLoading ? (
              <button 
                type="button" 
                onClick={stop}
                className="p-3 rounded-2xl transition-all shrink-0 mb-1 ml-2 bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                <StopCircle size={20} />
              </button>
            ) : (
              <button 
                type="submit" 
                suppressHydrationWarning
                disabled={!input.trim()}
                className={`p-3 rounded-2xl transition-all shrink-0 mb-1 ml-2 ${
                  input.trim() 
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                    : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Send size={20} className={input.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
              </button>
            )}
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-zinc-500">Amvibe AI menggunakan Gemini 3.1 Flash Lite. Harap tinjau ulang PRD yang dihasilkan.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
