'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Users, Activity, LogOut, ArrowLeft, Cpu } from 'lucide-react'
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
  const pathname = usePathname()
  const breadcrumb = BREADCRUMBS[pathname] || 'Overview'
  const sections = ['Overview', 'Governance']

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base font-bold text-zinc-100">Control Center</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
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
      <main className="flex-1 overflow-y-auto bg-zinc-950/50 relative">
        <div className="absolute inset-0 bg-[#0a0a0a] -z-20" />
        <NeuralMesh />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="h-16 flex items-center px-8 border-b border-white/[0.05] bg-[#020202]/80 backdrop-blur-xl sticky top-0 z-50">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-[#888]">
            Admin <span className="mx-2 text-[#444]">&rsaquo;</span>
            <span className="text-[#ededed]">{breadcrumb}</span>
          </h2>
        </div>
        <div className="p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
