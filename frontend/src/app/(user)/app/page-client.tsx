'use client'

import { FileText, Map, Code, ArrowUpRight, Workflow, Database } from 'lucide-react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { TiltCard } from '@/components/ui/TiltCard'
import { NeuralMesh } from '@/components/ui/NeuralMesh'

export interface DashboardStats {
  projects: number
  prds: number
}

interface UserDashboardClientProps {
  initialStats: DashboardStats
}

export default function UserDashboardClient({ initialStats }: UserDashboardClientProps) {

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, bounce: 0, duration: 0.6 }
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#030303] text-[#ededed] font-sans selection:bg-[#fff]/10 overflow-x-hidden">
      {/* Structural Grain & Vignette (Huashu Anti-Slop technique to remove flat colors) */}
      <NeuralMesh />
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />

      <div className="relative z-10 flex-1 overflow-y-auto app-scroll-surface" tabIndex={0}>
        <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-16">
          {/* Header - Typography & Hierarchy */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20 max-w-3xl"
          >
            <div className="mb-8 inline-flex items-center space-x-2 rounded-full border border-white/[0.05] bg-white/[0.04] px-3 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#a1a1aa]">Amvibe Enterprise</span>
            </div>

            <h1 className="mb-6 text-5xl font-medium leading-[1.05] tracking-tight text-[#f4f4f5] md:text-6xl lg:text-[72px]">
              Design. Build. <span className="text-[#a1a1aa]">Ship.</span>
            </h1>
            <p className="max-w-xl text-lg font-light leading-[1.6] text-[#888888] md:text-xl">
              An opinionated orchestration layer for product development. Automate PRDs, architect roadmaps, and generate context-aware prompts.
            </p>
          </motion.div>

          {/* Bento Grid - Layout & Rhythm */}
          <motion.div
            variants={container}
            initial={false}
            animate="show"
            className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12"
          >
            {/* PRD Generator (Featured 8-col) */}
            <motion.div variants={item} className="group h-full lg:col-span-8">
              <TiltCard intensity={10} className="h-full">
                <Link href="/app/prd" className="relative block h-full overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05] md:p-10">
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#222] bg-[#141414] text-[#ededed] shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.05] bg-white/[0.03] text-[#888] transition-all duration-500 group-hover:bg-[#ededed] group-hover:text-[#000]">
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" />
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-2xl font-medium tracking-tight text-[#ededed]">PRD Generator</h3>
                      <p className="max-w-md text-[15px] leading-relaxed text-[#888]">
                        Transform raw ideas into comprehensive requirements. Stop writing boilerplate, start architecting products.
                      </p>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>

            {/* Quick Stats (4-col Stacked) */}
            <motion.div variants={item} className="flex flex-col gap-4 md:gap-6 lg:col-span-4">
              <TiltCard intensity={15} className="flex-1">
                <div className="group relative h-full overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05]">
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />
                  <Database className="mb-4 h-5 w-5 text-[#444]" />
                  <div className="mb-1 text-[13px] font-medium uppercase tracking-wider text-[#888]">Projects</div>
                  <div className="text-4xl font-medium text-[#ededed]">{initialStats.projects}</div>
                </div>
              </TiltCard>
              <TiltCard intensity={15} className="flex-1">
                <div className="group relative h-full overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05]">
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />
                  <Workflow className="mb-4 h-5 w-5 text-[#444]" />
                  <div className="mb-1 text-[13px] font-medium uppercase tracking-wider text-[#888]">PRD Versions</div>
                  <div className="text-4xl font-medium text-[#ededed]">{initialStats.prds}</div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Next Step Planner (6-col) */}
            <motion.div variants={item} className="group lg:col-span-6">
              <TiltCard intensity={12}>
                <Link href="/app/planner" className="relative block h-[280px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05] md:p-10">
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#222] bg-[#141414] text-[#ededed]">
                      <Map className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="text-xl font-medium tracking-tight text-[#ededed]">Next Step Planner</h3>
                        <ArrowUpRight className="h-4 w-4 text-[#555] transition-all duration-500 group-hover:-translate-y-[2px] group-hover:translate-x-[2px] group-hover:text-[#ededed]" />
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#888]">
                        Break down complex requirements into actionable engineering roadmaps and modular epics.
                      </p>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>

            {/* Coding Prompts (6-col) */}
            <motion.div variants={item} className="group lg:col-span-6">
              <TiltCard intensity={12}>
                <Link href="/app/prompts" className="relative block h-[280px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05] md:p-10">
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#222] bg-[#141414] text-[#ededed]">
                      <Code className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="text-xl font-medium tracking-tight text-[#ededed]">Coding Prompts</h3>
                        <ArrowUpRight className="h-4 w-4 text-[#555] transition-all duration-500 group-hover:-translate-y-[2px] group-hover:translate-x-[2px] group-hover:text-[#ededed]" />
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#888]">
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
    </div>
  )
}
