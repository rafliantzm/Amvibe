'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Search, ShieldAlert, LogOut, MonitorSmartphone } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { Tooltip } from '@/components/ui/Tooltip'
import { CursorAura } from '@/components/ui/CursorAura'
import { DeveloperConsole } from '@/components/ui/DeveloperConsole'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { FocusProvider } from '@/components/ui/FocusProvider'
import { motion, AnimatePresence } from 'framer-motion'

import { usePathname } from 'next/navigation'

interface ClientLayoutProps {
  children: React.ReactNode
  userEmail?: string
  isAdmin: boolean
  adminConfig?: {
    menuLabel: string;
    commandLabel: string;
    commandDesc: string;
  } | null;
  projects?: any[]
  planners?: any[]
}

export default function ClientLayout({ children, userEmail, isAdmin, adminConfig, projects = [], planners = [] }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isCompact, setIsCompact] = useState(false)
  const pathname = usePathname()

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'project' | 'planner';
    id: string;
  }>({ isOpen: false, type: 'project', id: '' })

  const handleDeleteConfirm = async () => {
    if (deleteModal.type === 'project') {
      try {
        const res = await fetch(`/api/project?id=${deleteModal.id}`, { method: 'DELETE' });
        if (res.ok) window.location.href = '/app';
      } catch (err) {}
    } else {
      try {
        const res = await fetch(`/api/planner/history?id=${deleteModal.id}`, { method: 'DELETE' });
        if (res.ok) window.location.reload();
      } catch (err) {}
    }
    setDeleteModal(prev => ({ ...prev, isOpen: false }))
  }

  // Group items by project to keep it clean, or just show two sections
  // Let's show two sections: "Recent PRDs" and "Recent Planners"

  return (
    <FocusProvider>
      <div className={`flex h-screen overflow-hidden bg-transparent relative z-10 ${isCompact ? 'text-[12px]' : 'text-[14px]'}`}>
      <CursorAura />
      <DeveloperConsole />
      <CommandPalette adminConfig={adminConfig} />
      
      {/* Liquid Background Orb for Refraction */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#34d399]/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Floating Sidebar */}
      <div className={`py-4 pl-4 pr-0 h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0
        ${isSidebarOpen ? 'w-[280px]' : 'w-0 opacity-0 overflow-hidden !p-0'}`}>
        
        <aside 
          className="h-full rounded-[24px] border border-white/[0.04] bg-black/40 backdrop-blur-3xl saturate-[1.5] flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] overflow-hidden relative z-10"
        >
          {/* Top Header */}
          <div className="h-16 flex items-center justify-between px-5 min-w-[240px]">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-[#666] hover:text-[#ededed] transition-colors rounded-lg hover:bg-white/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            
            <Tooltip content="Create New PRD" position="right">
              <MagneticButton>
                <Link href="/app/prd" className="text-[#666] hover:text-[#ededed] transition-colors relative group">
                  <PlusCircle className="h-4 w-4" />
                </Link>
              </MagneticButton>
            </Tooltip>
          </div>
          
          {/* Navigation */}
          <nav className="px-3 space-y-1 mt-2 min-w-[240px]">
            <Link href="/app" className={`flex items-center px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-300 ${pathname === '/app' ? 'text-[#ededed] bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-l-2 border-[#34d399]' : 'text-[#888] hover:text-[#ededed] hover:bg-white/[0.02] border-l-2 border-transparent'}`}>
              <svg className={`mr-3 h-4 w-4 shrink-0 transition-colors ${pathname === '/app' ? 'text-[#34d399]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </Link>
            
            <Link href="/app/prd" className={`flex items-center px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-300 ${pathname === '/app/prd' ? 'text-[#ededed] bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-l-2 border-[#34d399]' : 'text-[#888] hover:text-[#ededed] hover:bg-white/[0.02] border-l-2 border-transparent'}`}>
              <svg className={`mr-3 h-4 w-4 shrink-0 transition-colors ${pathname === '/app/prd' ? 'text-[#34d399]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              PRD Generator
            </Link>

            <Link href="/app/planner" className={`flex items-center px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-300 ${pathname === '/app/planner' ? 'text-[#ededed] bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-l-2 border-[#34d399]' : 'text-[#888] hover:text-[#ededed] hover:bg-white/[0.02] border-l-2 border-transparent'}`}>
              <svg className={`mr-3 h-4 w-4 shrink-0 transition-colors ${pathname === '/app/planner' ? 'text-[#34d399]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
              Next Step Planner
            </Link>

            <Link href="/app/prompts" className={`flex items-center px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-300 ${pathname === '/app/prompts' ? 'text-[#ededed] bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-l-2 border-[#34d399]' : 'text-[#888] hover:text-[#ededed] hover:bg-white/[0.02] border-l-2 border-transparent'}`}>
              <svg className={`mr-3 h-4 w-4 shrink-0 transition-colors ${pathname === '/app/prompts' ? 'text-[#34d399]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              Coding Prompts
            </Link>
            
            <div className="pt-4 pb-2">
              <Link href="/app/search" className="flex items-center justify-between px-3 py-2 text-[12px] rounded-lg bg-white/[0.02] border border-white/[0.04] text-[#888] hover:bg-white/[0.04] hover:text-[#ededed] transition-colors group">
                <div className="flex items-center">
                  <Search className="mr-2 h-3.5 w-3.5 shrink-0" />
                  <span>Search...</span>
                </div>
                <span className="text-[9px] tracking-widest font-mono text-[#555] bg-white/[0.05] px-1.5 py-0.5 rounded">Ctrl+K</span>
              </Link>
            </div>
        </nav>

        {/* Previous Documents List */}
        <div className="flex-1 overflow-y-auto px-4 mt-8 min-w-[240px]">
          <div className="px-2 mb-3 text-[10px] font-bold text-[#555] uppercase tracking-[0.15em]">
            Recent PRDs
          </div>
          <div className="space-y-1 mb-8">
            {projects.length > 0 ? projects.map(p => (
              <div key={p.id} className="group relative flex items-center">
                <Link 
                  href={`/app/prd/${p.id}`} 
                  className={`flex-1 flex px-3 py-2 text-[13px] font-medium rounded-lg transition-colors truncate pr-8 ${pathname === `/app/prd/${p.id}` ? 'text-[#ededed] bg-white/[0.04]' : 'text-[#888] hover:bg-white/[0.02] hover:text-[#ededed]'}`}
                  title={p.name}
                >
                  <span className="truncate">{p.name}</span>
                </Link>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100 z-10 flex items-center justify-center">
                  <Tooltip content="Delete Project" position="left">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteModal({ isOpen: true, type: 'project', id: p.id })
                      }}
                      className="p-1.5 text-[#555] hover:text-red-400 hover:bg-red-400/10 rounded-md"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>
            )) : (
              <div className="px-3 py-2 text-sm text-[#555] italic">No PRDs yet</div>
            )}
          </div>

          <div className="px-2 mb-3 text-[10px] font-bold text-[#555] uppercase tracking-[0.15em]">
            Recent Planners
          </div>
          <div className="space-y-1">
            {planners && planners.length > 0 ? planners.slice(0, 5).map(plan => {
              const proj = projects.find(p => p.id === plan.project_id)
              const title = proj ? `${proj.name} (${plan.agent_name})` : `Plan (${plan.agent_name})`
              return (
                <div key={plan.id} className="group relative flex items-center">
                  <Link 
                    href={`/app/planner?view=${plan.project_id}`} 
                    className={`flex-1 flex items-center px-3 py-2 text-[13px] font-medium rounded-lg transition-colors truncate text-[#888] hover:bg-white/[0.02] hover:text-[#ededed] pr-8`}
                    title={title}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#34d399] mr-2.5 opacity-50 shadow-[0_0_8px_rgba(52,211,153,0.3)] flex-shrink-0"></div>
                    <span className="truncate">{title}</span>
                  </Link>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100 z-10 flex items-center justify-center">
                    <Tooltip content="Delete Planner" position="left">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteModal({ isOpen: true, type: 'planner', id: plan.id })
                        }}
                        className="p-1.5 text-[#555] hover:text-red-400 hover:bg-red-400/10 rounded-md"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                </div>
              )
            }) : (
              <div className="px-3 py-2 text-[13px] text-[#555] italic">No planners yet</div>
            )}
          </div>

          <div className="px-2 mt-6 mb-3 text-[10px] font-bold text-[#555] uppercase tracking-[0.15em]">
            Recent Prompts
          </div>
          <div className="space-y-1">
            {planners && planners.length > 0 ? planners.slice(0, 5).map(plan => {
              const proj = projects.find(p => p.id === plan.project_id)
              const title = proj ? `${proj.name} Prompts` : `Prompts (${plan.agent_name})`
              return (
                <div key={`prompt-${plan.id}`} className="group relative flex items-center">
                  <Link 
                    href={`/app/prompts?view=${plan.project_id}`} 
                    className={`flex-1 flex items-center px-3 py-2 text-[13px] font-medium rounded-lg transition-colors truncate text-[#888] hover:bg-white/[0.02] hover:text-[#ededed] pr-8`}
                    title={title}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#60a5fa] mr-2.5 opacity-50 shadow-[0_0_8px_rgba(96,165,250,0.3)] flex-shrink-0"></div>
                    <span className="truncate">{title}</span>
                  </Link>
                </div>
              )
            }) : (
              <div className="px-3 py-2 text-[13px] text-[#555] italic">No prompts yet</div>
            )}
          </div>
        </div>

        {/* Bottom Profile Area */}
        <div className="p-4 border-t border-white/[0.04] min-w-[240px] bg-black/20">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] text-[#555] font-mono uppercase tracking-widest flex items-center">
              <span className="px-1 py-0.5 border border-white/[0.05] rounded mr-1">⌘</span>
              <span className="px-1 py-0.5 border border-white/[0.05] rounded mr-1">K</span>
              Menu
            </span>
            <button 
              onClick={() => setIsCompact(!isCompact)}
              className={`p-1.5 rounded-lg transition-colors border ${isCompact ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20' : 'bg-white/[0.02] text-[#888] hover:text-[#ededed] border-white/[0.05]'}`}
              title={isCompact ? "Compact Mode" : "Comfortable Mode"}
            >
              <MonitorSmartphone size={14} />
            </button>
          </div>

          {adminConfig && (
            <Link href="/admin" className="flex items-center px-3 py-2.5 mb-2 text-[13px] font-medium rounded-xl text-[#888] hover:text-[#ededed] hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.04]">
              <ShieldAlert className="mr-3 h-4 w-4 shrink-0" />
              {adminConfig.menuLabel}
            </Link>
          )}
          
          <form action="/auth/signout" method="POST" className="group">
            <button type="submit" className="flex items-center w-full px-2.5 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors text-left border border-transparent hover:border-white/[0.04] shadow-sm">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/10 text-[#ededed] flex items-center justify-center font-medium text-xs mr-3 shrink-0">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[13px] font-medium text-[#ededed] truncate">
                  {userEmail?.split('@')[0] || 'User'}
                </span>
                <span className="text-[11px] text-[#888] truncate mt-0.5">
                  {userEmail || 'user@example.com'}
                </span>
              </div>
            </button>
          </form>
        </div>
      </aside>
      </div>

      {/* Main Content */}
        <div className="flex-1 overflow-y-auto relative bg-transparent z-0 transition-all duration-500">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 left-4 z-50 p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-white/5 bg-[#0a0a0a] border border-[#1a1a1a] shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}
          <div className="flex-1 overflow-auto relative z-10">
            <AnimatePresence mode="wait">
              <motion.main 
                key={pathname}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full relative z-10"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
        </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title={deleteModal.type === 'project' ? "Delete Project" : "Delete Planner History"}
        message={deleteModal.type === 'project' 
          ? "Are you sure you want to delete this project? This action cannot be undone and will permanently remove all associated PRDs and plans."
          : "Are you sure you want to delete this planner history? This action is permanent."}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        isDestructive={true}
      />
    </div>
    </FocusProvider>
  )
}
