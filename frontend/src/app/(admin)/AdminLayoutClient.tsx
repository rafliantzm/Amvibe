'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Users, Activity, LogOut, ArrowLeft, Cpu, Menu } from 'lucide-react'
import { NeuralMesh } from '@/components/ui/NeuralMesh'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: Activity, section: 'Overview' },
  { href: '/admin/configs', label: 'AI Configurations', icon: Settings, section: 'Governance' },
  { href: '/admin/users', label: 'User Management', icon: Users, section: 'Governance' },
]

const BREADCRUMBS: Record<string, string> = {
  '/admin':         'Overview',
  '/admin/configs': 'AI Configurations',
  '/admin/users':   'User Management',
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const breadcrumb = BREADCRUMBS[pathname] || 'Overview'
  const sections = ['Overview', 'Governance']

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const shouldLockOverlay = isSidebarOpen && window.innerWidth < 768

    document.body.classList.toggle('app-overlay-open', shouldLockOverlay)
    document.documentElement.classList.toggle('app-overlay-open', shouldLockOverlay)

    return () => {
      document.body.classList.remove('app-overlay-open')
      document.documentElement.classList.remove('app-overlay-open')
    }
  }, [isSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 overscroll-contain touch-none"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 z-50 h-full w-64 border-r border-zinc-800/50 bg-zinc-950 flex flex-col transition-transform duration-300 transform-gpu will-change-transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base font-bold text-zinc-100">Control Center</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 app-scroll-surface">
          {sections.map(section => {
            const items = NAV_ITEMS.filter(i => i.section === section)
            return (
              <div key={section} className="mb-4">
                <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {section}
                </div>
                {items.map(item => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-white/5 text-white'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      {item.label}
                      {item.href === '/admin/configs' && (
                        <span className="ml-auto">
                          <Cpu size={11} className="text-[#34d399] opacity-60" />
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/50 space-y-1">
          <Link href="/app" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            <ArrowLeft className="mr-3 h-4 w-4 text-zinc-400" />
            User Workspace
          </Link>
          <form action="/auth/signout" method="POST">
            <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950/50 relative min-w-0 w-full app-scroll-surface">
        <div className="absolute inset-0 bg-[#0a0a0a] -z-20" />
        <NeuralMesh />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="h-16 flex items-center px-4 md:px-8 border-b border-white/[0.05] bg-[#020202]/80 backdrop-blur-xl sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mr-3 p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-white/5"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-[#888]">
            Admin <span className="mx-2 text-[#444]">&rsaquo;</span>
            <span className="text-[#ededed]">{breadcrumb}</span>
          </h2>
        </div>
        <div className="p-4 md:p-8 animate-fade-in w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  )
}
