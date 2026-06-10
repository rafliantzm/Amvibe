'use client'

import { useState, useRef, useEffect } from 'react'
import { PRDViewer } from './PRDViewer'
import { PRDMinimap } from './PRDMinimap'
import { useCompletion } from '@ai-sdk/react'
import { Send, Sparkles, StopCircle, ChevronDown, Check, List, Download, Printer, Trash2, ArrowUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { NeuralMesh } from './NeuralMesh'

interface Version {
  version_number: number;
  content: string;
  created_at: string;
}

interface PRDInteractiveViewProps {
  projectId: string;
  projectName: string;
  initialVersions: Version[];
}

export function PRDInteractiveView({ projectId, projectName, initialVersions }: PRDInteractiveViewProps) {
  // Use state to keep track of versions locally after generation
  const [versions, setVersions] = useState<Version[]>(initialVersions)

  // Highest version number initially
  const maxVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) : 1;
  const [activeVersion, setActiveVersion] = useState<number>(maxVersion)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const activeContent = versions.find(v => v.version_number === activeVersion)?.content || ''

  const router = useRouter()
  const [isTocOpen, setIsTocOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const tocRef = useRef<HTMLDivElement>(null)
  const versionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setIsTocOpen(false)
      }
      if (versionRef.current && !versionRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const extractHeadings = (markdown: string) => {
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const headings = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      });
    }
    return headings;
  };

  const handleDownloadMd = () => {
    const blob = new Blob([activeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_v${activeVersion}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this PRD and all its versions? This action cannot be undone.')) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        
        if (error) {
          alert(`Error deleting project: ${error.message}`);
          console.error(error);
          return;
        }
        
        // Force a full page reload to bust Next.js App Router cache
        // so the deleted project disappears from the sidebar instantly.
        window.location.href = '/app';
      } catch (error) {
        alert('Failed to delete project.');
        console.error('Failed to delete project:', error);
      }
    }
  };

  const { completion, input, handleInputChange, handleSubmit, isLoading, stop } = useCompletion({
    api: '/api/prd',
    streamProtocol: 'text',
    body: {
      projectId,
      previousPrdContent: activeContent
    },
    onError: (error) => {
      alert(`API Error: ${error.message}. The AI model might not be supported or the server crashed. Check console for details.`);
      console.error("useCompletion error:", error);
    },
    onFinish: (prompt, result) => {
      // Guard against silent API failures or safety filter blocks
      if (!result || result.trim().length === 0) {
        alert("Peringatan: Server AI mengembalikan respon kosong. Ini biasanya terjadi jika permintaan terblokir oleh filter keamanan (Safety Filters) Google, atau muatan konteks terlalu besar. Silakan coba lagi dengan prompt yang berbeda.");
        return;
      }
      
      // Optimistically add the new version to state
      const newVersionNum = maxVersion + 1;
      setVersions(prev => [{
        version_number: newVersionNum,
        content: result,
        created_at: new Date().toISOString()
      }, ...prev]);
      setActiveVersion(newVersionNum);
    }
  })

  // Auto scroll
  useEffect(() => {
    if (isLoading && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [completion, isLoading])

  return (
    <div className="flex flex-col h-screen w-full relative animate-fade-in bg-transparent">
      <NeuralMesh />
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-0" />
      
      {/* Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto relative pb-10 pt-8 z-10">
        
        {/* Inner Centered Content Wrapper */}
        <div className="max-w-5xl mx-auto px-8">
          {/* Header (Scrolls away naturally) */}
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <h1 className="text-[28px] font-bold text-white mb-1 leading-tight tracking-tight">{projectName}</h1>
              <p className="text-zinc-500 text-sm truncate max-w-full md:max-w-xl">{activeContent.slice(0, 80).replace(/[#*`\n]/g, '')}...</p>
            </div>

            {/* Action Buttons Group */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
              {/* ToC Button (Kept as fallback/dropdown, though minimap exists) */}
              <div className="relative" ref={tocRef}>
                <button 
                  onClick={() => setIsTocOpen(!isTocOpen)}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                >
                  <List size={14} /> <span>ToC</span>
                </button>
                
                {isTocOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-[#111] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                      {extractHeadings(activeContent).map((h, i) => (
                        <a
                          key={i}
                          href={`#${h.id}`}
                          onClick={() => setIsTocOpen(false)}
                          className={`block px-3 py-2 text-[12px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 rounded-lg transition-colors ${h.level === 1 ? 'font-bold text-white' : h.level === 2 ? 'pl-4' : 'pl-6'}`}
                        >
                          {h.text}
                        </a>
                      ))}
                      {extractHeadings(activeContent).length === 0 && (
                        <div className="px-3 py-2 text-xs text-zinc-600 italic">No headings found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Version Switcher */}
              <div className="relative" ref={versionRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                >
                  <span>v{activeVersion}</span>
                  {isLoading && <span className="flex h-2 w-2 relative ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>}
                  <ChevronDown size={14} className={`ml-1 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#111] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                      {versions.map(v => (
                        <button
                          key={v.version_number}
                          onClick={() => { setActiveVersion(v.version_number); setIsDropdownOpen(false) }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${activeVersion === v.version_number ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">v{v.version_number}</span>
                            <span className="text-[10px] text-zinc-600">{new Date(v.created_at).toLocaleDateString()}</span>
                          </div>
                          {activeVersion === v.version_number && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>

              <button onClick={handleDownloadMd} className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors">
                <Download size={14} /> <span>.md</span>
              </button>
              
              <button onClick={handlePrintPdf} className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors">
                <Printer size={14} /> <span>PDF</span>
              </button>

              <button onClick={handleDelete} className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-medium border border-red-500/20 transition-colors ml-2">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div ref={contentRef}>
            <PRDViewer content={isLoading ? (completion || activeContent) : activeContent} />
          </div>
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      <PRDMinimap contentRef={contentRef} />

      {/* Chat Input Box (Flex Footer) */}
      <div className="pt-2 pb-4 print:hidden relative z-10">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="relative flex items-center bg-[#050505] border border-white/[0.08] focus-within:border-white/[0.15] focus-within:bg-[#0a0a0a] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-1.5 pl-5 transition-all duration-300">
              {isLoading ? (
                <div className="mr-3 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>
              ) : (
                <Sparkles className="text-[#555] mr-3 h-4 w-4 shrink-0 transition-colors group-focus-within:text-[#34d399]" />
              )}

              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder={isLoading ? "Architecting changes..." : "Ask anything or request revisions..."}
                className="flex-1 bg-transparent text-[#ededed] placeholder-[#555] focus:outline-none text-[14px] py-2 disabled:opacity-50 font-light"
              />

              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="bg-white/[0.05] hover:bg-white/[0.1] text-[#888] hover:text-[#ededed] h-9 w-9 flex items-center justify-center rounded-[14px] transition-colors shrink-0 ml-2 border border-white/[0.05]"
                >
                  <StopCircle className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-white/[0.05] hover:bg-[#34d399]/20 disabled:opacity-30 disabled:bg-white/[0.02] text-[#888] hover:text-[#34d399] disabled:text-[#444] h-9 w-9 flex items-center justify-center rounded-[14px] transition-colors shrink-0 ml-2 border border-white/[0.05]"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-zinc-600 font-medium">
              Amvibe AI can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
