'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loginWithGoogle } from './actions'
import { NeuralMesh } from '@/components/ui/NeuralMesh'
import { GlitchText } from '@/components/ui/GlitchText'
import { ShieldCheck, Terminal as TerminalIcon } from 'lucide-react'

const BOOT_LOGS = [
  "INITIALIZING KERNEL...",
  "MOUNTING ENCRYPTED VOLUMES... [OK]",
  "ESTABLISHING SECURE CONNECTION...",
  "HANDSHAKE PROTOCOL: ACCEPTED",
  "LOADING NEURAL MESH...",
  "AWAITING BIOMETRIC CLEARANCE."
]

export default function LoginPage() {
  const [bootStep, setBootStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    let currentLog = 0
    const interval = setInterval(() => {
      if (currentLog < BOOT_LOGS.length) {
        setLogs(prev => [...prev, BOOT_LOGS[currentLog]])
        currentLog++
      } else {
        clearInterval(interval)
        setTimeout(() => setBootStep(1), 500)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020202] p-4 font-sans text-[#ededed] relative overflow-hidden">
      {/* Global Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-[9999]" />
      
      {/* Backgrounds */}
      <AnimatePresence>
        {bootStep === 1 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 2 }}
            className="absolute inset-0 z-0"
          >
            <NeuralMesh />
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md z-10 relative">
        
        {/* Boot Sequence Terminal */}
        <AnimatePresence mode="wait">
          {bootStep === 0 ? (
            <motion.div
              key="boot"
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-mono text-[11px] text-[#34d399] tracking-widest leading-loose flex flex-col items-center justify-center h-64"
            >
              <div className="w-full max-w-xs space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex space-x-2 opacity-80">
                    <span>{'>'}</span>
                    <span>{log}</span>
                  </div>
                ))}
                <motion.div 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-2 h-3 bg-[#34d399] inline-block ml-4"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* FUI Crosshair Frame */}
              <div className="absolute -inset-8 border border-white/[0.05] bg-[#000]/40 backdrop-blur-md z-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
              <div className="absolute -inset-8 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#34d399]/50" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#34d399]/50" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#34d399]/50" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#34d399]/50" />
              </div>

              <div className="relative z-10 px-4 py-6">
                <div className="mb-12 flex flex-col items-center text-center">
                  <div className="w-12 h-12 border border-[#34d399]/30 bg-[#34d399]/10 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                    <ShieldCheck className="text-[#34d399]" size={24} />
                  </div>
                  
                  <h2 className="text-[32px] md:text-[40px] leading-none font-bold tracking-tighter text-white mb-4 uppercase font-sans">
                    <GlitchText text="AUTHENTICATE_" delay={300} speed={0.6} />
                  </h2>
                  <div className="flex items-center space-x-2 bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-[#34d399] rounded-full animate-ping" />
                    <p className="text-[9px] text-[#34d399] font-mono tracking-[0.3em] uppercase">
                      SYSTEM LOCK: ENGAGED
                    </p>
                  </div>
                </div>
                
                <form action={loginWithGoogle} className="mt-16">
                  <button
                    type="submit"
                    className="group relative flex w-full items-center justify-between bg-[#0a0a0a] border border-white/[0.1] hover:border-[#34d399]/50 p-4 text-[13px] font-mono text-[#888] hover:text-[#34d399] transition-all duration-500 overflow-hidden"
                  >
                    {/* Scanner Line Effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#34d399]/20 to-transparent translate-x-[-100%] group-hover:animate-[scan_1.5s_ease-in-out_infinite] pointer-events-none" />
                    
                    <span className="flex items-center gap-4 relative z-10">
                      <svg className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity text-white group-hover:text-[#34d399]" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                      </svg>
                      <span className="uppercase tracking-widest font-bold">INITIATE_OAUTH</span>
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10 flex items-center space-x-2">
                      <span>[ RUN ]</span>
                      <TerminalIcon size={12} />
                    </span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
