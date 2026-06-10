'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, LayoutTemplate, ShieldAlert, TerminalSquare, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { playWhoosh, playClick } from '@/utils/audio'
import { createClient } from '@/utils/supabase/client'

interface CommandPaletteProps {
  adminConfig?: {
    menuLabel: string;
    commandLabel: string;
    commandDesc: string;
  } | null;
}

export function CommandPalette({ adminConfig }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const baseCommands = [
    { id: 'prd', icon: FileText, label: 'Create New PRD', desc: 'Initialize an AI-generated Product Requirements Document', action: () => router.push('/app/prd') },
    { id: 'planner', icon: LayoutTemplate, label: 'Run Planner', desc: 'Synthesize an architecture implementation plan', action: () => router.push('/app/planner') },
    { id: 'prompts', icon: TerminalSquare, label: 'View Coding Prompts', desc: 'Access the terminal prompt registry', action: () => router.push('/app/prompts') },
  ]

  const commands = adminConfig 
    ? [...baseCommands, { id: 'admin', icon: ShieldAlert, label: adminConfig.commandLabel, desc: adminConfig.commandDesc, action: () => router.push('/admin') }]
    : baseCommands

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.desc.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((open) => {
          if (!open) playWhoosh()
          return !open
        })
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      setSelectedIndex(0)
    } else {
      setQuery('')
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#000]/70 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.08] rounded-[24px] shadow-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.03)] flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-4 border-b border-white/[0.05]">
              <Search className="w-5 h-5 text-[#555] mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setSelectedIndex((prev) => Math.max(prev - 1, 0))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (filteredCommands[selectedIndex]) {
                      playClick()
                      filteredCommands[selectedIndex].action()
                      setIsOpen(false)
                    }
                  }
                }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-[#ededed] text-[15px] placeholder-[#555] font-light"
              />
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.05] text-[10px] text-[#555] font-mono">ESC</span>
                <span className="text-[10px] text-[#444]">to close</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[#555] text-[13px] font-mono">No matching subroutines found.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, i) => {
                    const Icon = cmd.icon
                    const isSelected = i === selectedIndex
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          playClick()
                          cmd.action()
                          setIsOpen(false)
                        }}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center justify-between p-3 rounded-[16px] border transition-all text-left group ${
                          isSelected 
                            ? 'bg-[#34d399]/10 border-[#34d399]/20' 
                            : 'hover:bg-[#34d399]/5 border-transparent hover:border-[#34d399]/10'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mr-4 transition-all ${
                            isSelected 
                              ? 'bg-[#34d399]/20 border-[#34d399]/30' 
                              : 'bg-white/[0.02] border-white/[0.04] group-hover:bg-[#34d399]/10 group-hover:border-[#34d399]/20'
                          }`}>
                            <Icon className={`w-5 h-5 transition-colors ${
                              isSelected ? 'text-[#34d399]' : 'text-[#888] group-hover:text-[#34d399]'
                            }`} />
                          </div>
                          <div>
                            <h4 className={`text-[14px] font-medium mb-0.5 transition-colors ${
                              isSelected ? 'text-white' : 'text-[#ededed] group-hover:text-white'
                            }`}>{cmd.label}</h4>
                            <p className="text-[12px] text-[#666] font-light">{cmd.desc}</p>
                          </div>
                        </div>
                        <ArrowRight className={`w-4 h-4 transition-all ${
                          isSelected ? 'text-[#34d399] opacity-100 translate-x-1' : 'text-[#555] group-hover:text-[#34d399] opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                        }`} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-[#050505] px-4 py-3 border-t border-white/[0.03] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Amvibe OS <span className="text-[#34d399]">v2.0</span></span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-[#555] flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.05]">↑</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.05]">↓</span>
                  to navigate
                </span>
                <span className="text-[10px] text-[#555] flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.05]">Enter</span>
                  to select
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
