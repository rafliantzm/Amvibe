'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'

export function DeveloperConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error', text: string }[]>([
    { type: 'output', text: 'Amvibe OS Kernel v4.0.1 initialized.' },
    { type: 'output', text: 'Type "help" for a list of available routines.' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    if (!trimmed) return

    setHistory(prev => [...prev, { type: 'input', text: cmd }])
    setInput('')

    setTimeout(() => {
      switch (trimmed) {
        case 'help':
          setHistory(prev => [...prev, 
            { type: 'output', text: 'Available commands:' },
            { type: 'output', text: '  status    - Show system vitals' },
            { type: 'output', text: '  clear     - Clear terminal' },
            { type: 'output', text: '  reboot    - Restart architecture engine' },
            { type: 'output', text: '  matrix    - Enter the void' }
          ])
          break
        case 'status':
          setHistory(prev => [...prev, 
            { type: 'output', text: 'CPU: 12% | RAM: 4.2GB/16GB | NET: SECURE' },
            { type: 'output', text: 'All systems nominal.' }
          ])
          break
        case 'clear':
          setHistory([])
          break
        case 'reboot':
          setHistory(prev => [...prev, { type: 'output', text: 'Rebooting systems...' }])
          setTimeout(() => window.location.reload(), 1000)
          break
        case 'matrix':
          setHistory(prev => [...prev, { type: 'output', text: 'Wake up, Neo...' }])
          break
        default:
          setHistory(prev => [...prev, { type: 'error', text: `Command not found: ${trimmed}` }])
      }
    }, 150)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-[99999] bg-[#030303]/95 backdrop-blur-3xl border-b border-[#34d399]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-[40vh] flex flex-col font-mono text-[13px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-black/50 border-b border-white/[0.05]">
            <div className="flex items-center text-[#555]">
              <Terminal size={14} className="mr-2" />
              <span>Developer Console</span>
            </div>
            <div className="text-[#34d399] text-[10px] uppercase tracking-widest animate-pulse">
              Root Access
            </div>
          </div>

          {/* Terminal Output */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
            {history.map((line, i) => (
              <div key={i} className="flex">
                {line.type === 'input' && <span className="text-[#34d399] mr-2">root@amvibe:~#</span>}
                <span className={`${
                  line.type === 'input' ? 'text-[#ededed]' : 
                  line.type === 'error' ? 'text-red-400' : 'text-[#888]'
                }`}>
                  {line.text}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/30 border-t border-white/[0.05] flex">
            <span className="text-[#34d399] mr-2">root@amvibe:~#</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommand(input)
              }}
              className="flex-1 bg-transparent border-none outline-none text-[#ededed] font-mono"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
