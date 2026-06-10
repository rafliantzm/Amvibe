'use client'

import { FileText, Map, Code, ArrowUpRight, Workflow, Sparkles, Database } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TiltCard } from '@/components/ui/TiltCard'
import { NeuralMesh } from '@/components/ui/NeuralMesh'

export default function UserDashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0, duration: 0.6 } }
  }

  return (
    <div className="min-h-screen w-full bg-[#030303] text-[#ededed] font-sans selection:bg-[#fff]/10 overflow-x-hidden">
      
      {/* Structural Grain & Vignette (Huashu Anti-Slop technique to remove flat colors) */}
      <NeuralMesh />
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-10 md:py-16">
        
        {/* Header - Typography & Hierarchy */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 max-w-3xl"
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/[0.05] rounded-full px-3 py-1.5 mb-8 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span className="text-[11px] font-medium text-[#a1a1aa] tracking-[0.2em] uppercase">Amvibe Enterprise</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-medium tracking-tight text-[#f4f4f5] leading-[1.05] mb-6">
            Design. Build. <span className="text-[#a1a1aa]">Ship.</span>
          </h1>
          <p className="text-[#888888] text-lg md:text-xl leading-[1.6] max-w-xl font-light">
            An opinionated orchestration layer for product development. Automate PRDs, architect roadmaps, and generate context-aware prompts.
          </p>
        </motion.div>
        
        {/* Bento Grid - Layout & Rhythm */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6"
        >
          {/* PRD Generator (Featured 8-col) */}
          <motion.div variants={item} className="lg:col-span-8 group h-full">
            <TiltCard intensity={10} className="h-full">
              <Link href="/app/prd" className="block h-full relative p-8 md:p-10 rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden shadow-2xl">
              {/* Subtle inner shadow for depth */}
              <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-[#141414] border border-[#222] flex items-center justify-center text-[#ededed] shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#888] group-hover:bg-[#ededed] group-hover:text-[#000] transition-all duration-500">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-medium text-[#ededed] mb-2 tracking-tight">PRD Generator</h3>
                  <p className="text-[#888] text-[15px] leading-relaxed max-w-md">
                    Transform raw ideas into comprehensive requirements. Stop writing boilerplate, start architecting products.
                  </p>
                </div>
              </div>
            </Link>
            </TiltCard>
          </motion.div>

          {/* Quick Stats (4-col Stacked) */}
          <motion.div variants={item} className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
            <TiltCard intensity={15} className="flex-1">
              <div className="h-full rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-8 relative overflow-hidden group hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              <Database className="h-5 w-5 text-[#444] mb-4" />
              <div className="text-[13px] text-[#888] uppercase tracking-wider mb-1 font-medium">Projects</div>
              <div className="text-4xl font-medium text-[#ededed]">12</div>
              </div>
            </TiltCard>
            <TiltCard intensity={15} className="flex-1">
              <div className="h-full rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-8 relative overflow-hidden group hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              <Workflow className="h-5 w-5 text-[#444] mb-4" />
              <div className="text-[13px] text-[#888] uppercase tracking-wider mb-1 font-medium">Speed</div>
              <div className="text-4xl font-medium text-[#ededed]">4.2<span className="text-2xl text-[#666]">s</span></div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Next Step Planner (6-col) */}
          <motion.div variants={item} className="lg:col-span-6 group">
            <TiltCard intensity={12}>
              <Link href="/app/planner" className="block h-[280px] relative p-8 md:p-10 rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="h-12 w-12 rounded-2xl bg-[#141414] border border-[#222] flex items-center justify-center text-[#ededed]">
                  <Map className="h-5 w-5" />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-medium text-[#ededed] tracking-tight">Next Step Planner</h3>
                    <ArrowUpRight className="h-4 w-4 text-[#555] group-hover:text-[#ededed] group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-all duration-500" />
                  </div>
                  <p className="text-[#888] text-[15px] leading-relaxed">
                    Break down complex requirements into actionable engineering roadmaps and modular epics.
                  </p>
                </div>
              </div>
            </Link>
            </TiltCard>
          </motion.div>

          {/* Coding Prompts (6-col) */}
          <motion.div variants={item} className="lg:col-span-6 group">
            <TiltCard intensity={12}>
              <Link href="/app/prompts" className="block h-[280px] relative p-8 md:p-10 rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="h-12 w-12 rounded-2xl bg-[#141414] border border-[#222] flex items-center justify-center text-[#ededed]">
                  <Code className="h-5 w-5" />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-medium text-[#ededed] tracking-tight">Coding Prompts</h3>
                    <ArrowUpRight className="h-4 w-4 text-[#555] group-hover:text-[#ededed] group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-all duration-500" />
                  </div>
                  <p className="text-[#888] text-[15px] leading-relaxed">
                    Generate highly-tuned, context-rich engineering prompts ready for Cursor, Cline, or DeepSeek.
                  </p>
                </div>
              </div>
            </Link>
            </TiltCard>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
