'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEMO_SCENARIOS = [
  {
    title: "Payment Routing Service",
    subtitle: "System Architecture Draft",
    url: "amvibe.os/system/planner",
    activeTaskIndex: 0,
    promptText: "Generating Kubernetes manifests...|",
    content: (
      <>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
          <div className="text-[10px] text-[#555] font-bold tracking-widest mb-2">SYSTEM ARCHITECTURE</div>
          <div className="h-2 bg-white/10 rounded-full w-full mb-1.5"></div>
          <div className="h-2 bg-white/10 rounded-full w-[90%] mb-1.5"></div>
          <div className="h-2 bg-white/10 rounded-full w-[80%]"></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="mb-4">
          <div className="text-[10px] text-[#555] font-bold tracking-widest mb-2 mt-4">API GATEWAY LAYER</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-[#34d399]/10 rounded border border-[#34d399]/20"></div>
            <div className="h-10 bg-white/5 rounded border border-white/5"></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="mb-4">
          <div className="text-[10px] text-[#555] font-bold tracking-widest mb-2 mt-4">MICROSERVICES</div>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></div>
              <div className="h-2 bg-[#34d399]/30 rounded-full w-1/3"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></div>
              <div className="h-2 bg-[#3b82f6]/30 rounded-full w-1/2"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7]"></div>
              <div className="h-2 bg-[#a855f7]/30 rounded-full w-2/5"></div>
            </div>
          </div>
        </motion.div>
      </>
    )
  },
  {
    title: "AI Travel Agent",
    subtitle: "Product Requirements Document",
    url: "amvibe.os/product/prd",
    activeTaskIndex: 1,
    promptText: "Structuring user personas and epics...|",
    content: (
      <>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
          <div className="text-[10px] text-[#555] font-bold tracking-widest mb-2">USER PERSONAS</div>
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#e8705f]/20 border border-[#e8705f]/30"></div>
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-white/10 rounded-full w-1/4 mt-1"></div>
              <div className="h-2 bg-white/5 rounded-full w-3/4"></div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="mb-4">
          <div className="text-[10px] text-[#555] font-bold tracking-widest mb-2 mt-4">CORE EPICS</div>
          <div className="space-y-2">
            <div className="p-2 bg-white/5 border border-white/5 rounded">
              <div className="h-2 bg-[#3b82f6]/40 rounded-full w-1/3 mb-2"></div>
              <div className="h-1.5 bg-white/10 rounded-full w-full"></div>
            </div>
            <div className="p-2 bg-white/5 border border-white/5 rounded">
              <div className="h-2 bg-[#a855f7]/40 rounded-full w-1/4 mb-2"></div>
              <div className="h-1.5 bg-white/10 rounded-full w-4/5"></div>
            </div>
          </div>
        </motion.div>
      </>
    )
  },
  {
    title: "SaaS CRM Portal",
    subtitle: "Agentic Coding Prompts",
    url: "amvibe.os/export/terminal",
    activeTaskIndex: 2,
    promptText: "Extracting Next.js component tree...|",
    content: (
      <>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
          <div className="text-[10px] text-[#555] font-bold tracking-widest mb-2">CLI COMMAND EXTRACTED</div>
          <div className="p-3 bg-black border border-white/10 rounded font-mono text-[#34d399] text-[9px] leading-relaxed">
            $ cursor --instruction &quot;Build the auth module using Supabase according to the architecture draft&quot;<br/>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.2 }}>
              &gt; Analyzing context files...<br/>
            </motion.span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.2 }}>
              &gt; Generating React components...<br/>
            </motion.span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="mb-4 flex items-center space-x-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-[#34d399] animate-ping"></div>
            <span className="text-[#888] text-[10px] font-mono">READY FOR EXECUTION</span>
        </motion.div>
      </>
    )
  }
]

export function DemoLoop() {
  const [scenarioIdx, setScenarioIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScenarioIdx(prev => (prev + 1) % DEMO_SCENARIOS.length)
    }, 5000) // Switch scenario every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const current = DEMO_SCENARIOS[scenarioIdx]

  return (
    <div className="w-full max-w-[500px] aspect-[4/3] bg-[#111] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex-1 flex justify-center px-4">
          <motion.div 
            key={current.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/50 text-[#888] text-[10px] px-4 py-1.5 rounded-full flex items-center font-mono"
          >
            <span className="opacity-50 mr-2">🔒</span> {current.url}
          </motion.div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-[#555] tracking-widest">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>DEMO LOOP</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mock Sidebar */}
        <div className="w-[140px] border-r border-white/5 bg-[#141414] p-3 hidden sm:flex flex-col">
          <div className="h-6 rounded bg-white/5 mb-4 flex items-center px-2">
            <span className="text-[10px] text-[#555]">Search...</span>
          </div>
          <div className="text-[9px] text-[#555] font-bold mb-2 tracking-widest">ACTIVE TASKS</div>
          
          <div className={`text-[11px] font-medium px-2 py-1.5 rounded mb-1 transition-all ${current.activeTaskIndex === 0 ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20' : 'text-[#888] hover:bg-white/5 border border-transparent'}`}>
            Payment Gateway
          </div>
          <div className={`text-[11px] font-medium px-2 py-1.5 rounded mb-1 transition-all ${current.activeTaskIndex === 1 ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20' : 'text-[#888] hover:bg-white/5 border border-transparent'}`}>
            AI Travel Agent
          </div>
          
          <div className="text-[9px] text-[#555] font-bold mt-4 mb-2 tracking-widest">COMPLETED</div>
          <div className={`text-[11px] font-medium px-2 py-1.5 rounded transition-all opacity-70 ${current.activeTaskIndex === 2 ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20' : 'text-[#888] hover:bg-white/5 border border-transparent'}`}>
            SaaS CRM Portal
          </div>
        </div>

        {/* Mock Main Area */}
        <div className="flex-1 p-5 bg-[#0a0a0a] relative flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div 
              key={current.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-end mb-6 border-b border-white/5 pb-4"
            >
              <div>
                <h2 className="text-[#ededed] font-medium text-sm mb-1">{current.title}</h2>
                <p className="text-[#666] text-[11px]">{current.subtitle}</p>
              </div>
              <div className="flex space-x-1">
                <span className="px-1.5 py-0.5 bg-white/10 text-[#888] text-[9px] rounded font-mono">v1</span>
                <span className="px-1.5 py-0.5 bg-[#34d399]/20 text-[#34d399] text-[9px] rounded font-mono border border-[#34d399]/30">v2</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={scenarioIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {current.content}
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
          </div>

          {/* Prompt input area mock */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={current.promptText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[#666] text-[11px] font-mono"
                >
                  {current.promptText}
                </motion.span>
              </AnimatePresence>
              <div className="w-4 h-4 bg-[#34d399] rounded-sm animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
