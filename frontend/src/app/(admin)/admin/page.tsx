'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Users, Key, Activity, Server, Network, Terminal, ShieldAlert } from 'lucide-react'
import { GlitchText } from '@/components/ui/GlitchText'

export default function AdminDashboard() {
  const [logs, setLogs] = useState([
    { time: '15:23:41', type: 'AUTH', msg: 'User session established (ID: a7f...90c)', level: 'info' },
    { time: '15:23:45', type: 'PRD', msg: 'Generation started for project "SaaS CRM"', level: 'success' },
    { time: '15:24:02', type: 'API', msg: 'Cache miss on route /api/planner/history', level: 'info' },
    { time: '15:24:10', type: 'WARN', msg: 'High latency detected on Gemini API (450ms)', level: 'warn' },
    { time: '15:24:15', type: 'DB', msg: 'Connection pool stabilized', level: 'success' },
  ])

  // Fake stream simulation for the FUI effect
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date().toTimeString().split(' ')[0]
      const events = [
        { type: 'NET', msg: 'Incoming traffic spike detected (120 req/s)', level: 'warn' },
        { type: 'API', msg: 'Model evaluation passed for gemini-2.5-flash', level: 'info' },
        { type: 'AUTH', msg: 'Admin configuration snapshot saved', level: 'success' },
        { type: 'SYS', msg: 'Background worker #4 recycled gracefully', level: 'info' },
        { type: 'PRD', msg: 'PRD document compiled successfully', level: 'success' },
      ]
      const randomEvent = events[Math.floor(Math.random() * events.length)]
      setLogs(prev => [
        ...prev.slice(1), 
        { time: newTime, ...randomEvent }
      ])
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto p-8 font-sans relative"
    >
      {/* Background Grid - FUI Style */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 border-b border-[#34d399]/20 pb-6 relative">
        <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-[#34d399] to-transparent" />
        <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-[#34d399]" />
        
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-[#ededed] mb-2 flex items-center">
            <Terminal className="mr-3 text-[#34d399] opacity-70" size={28} />
            GLOBAL OVERSIGHT
          </h1>
          <p className="text-[#34d399] font-mono text-[11px] uppercase tracking-[0.2em] flex items-center bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1 rounded-sm w-max shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] mr-3 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            System Status: Nominal
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="px-3 py-1.5 bg-[#050505] border border-white/[0.08] text-[10px] font-mono text-[#888] flex items-center shadow-inner">
            <span className="text-[#555] mr-2">LTC</span>
            <span className="text-[#34d399]">14ms</span>
          </div>
          <div className="px-3 py-1.5 bg-[#050505] border border-white/[0.08] text-[10px] font-mono text-[#888] flex items-center shadow-inner">
            <span className="text-[#555] mr-2">UP</span>
            <span className="text-blue-400">99.99%</span>
          </div>
        </div>
      </motion.div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric 1 */}
        <motion.div variants={itemVariants} className="p-6 rounded-none bg-[#020202] border border-[#1e3a8a]/50 shadow-[inset_0_0_20px_rgba(30,58,138,0.1)] relative overflow-hidden group">
          {/* FUI Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500"></div>
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-mono text-blue-400/70 uppercase tracking-[0.15em]">Active Connections</p>
              <div className="flex items-baseline mt-2">
                <h3 className="text-5xl font-light text-blue-100 tracking-tighter">
                  <GlitchText text="1,248" delay={100} />
                </h3>
                <span className="ml-2 text-xs font-mono text-blue-500/50">+12%</span>
              </div>
            </div>
            <div className="p-2.5 bg-blue-950/30 border border-blue-900/50">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="h-[2px] w-full bg-blue-950 overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />
          </div>
        </motion.div>
        
        {/* Metric 2 */}
        <motion.div variants={itemVariants} className="p-6 rounded-none bg-[#020202] border border-[#581c87]/50 shadow-[inset_0_0_20px_rgba(88,28,135,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500"></div>
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-mono text-purple-400/70 uppercase tracking-[0.15em]">Compute Core</p>
              <h3 className="text-2xl font-light text-purple-100 mt-4 tracking-tight leading-none">
                <GlitchText text="Gemini 3.1" delay={300} />
                <span className="block text-sm text-purple-400 mt-1 opacity-70">Flash Lite</span>
              </h3>
            </div>
            <div className="p-2.5 bg-purple-950/30 border border-purple-900/50">
              <Cpu className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="h-[2px] w-full bg-purple-950 overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '88%' }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
              className="absolute top-0 left-0 h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
            />
          </div>
        </motion.div>
        
        {/* Metric 3 */}
        <motion.div variants={itemVariants} className="p-6 rounded-none bg-[#020202] border border-[#065f46]/50 shadow-[inset_0_0_20px_rgba(6,95,70,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#34d399]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#34d399]"></div>
          <div className="absolute inset-0 bg-[#34d399]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-mono text-[#34d399]/70 uppercase tracking-[0.15em]">API Gateway</p>
              <h3 className="text-3xl font-bold text-[#34d399] mt-3 tracking-widest drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                <GlitchText text="SECURE" delay={500} />
              </h3>
            </div>
            <div className="p-2.5 bg-[#064e3b]/30 border border-[#065f46]/50">
              <ShieldAlert className="h-5 w-5 text-[#34d399]" />
            </div>
          </div>
          <div className="h-[2px] w-full bg-[#064e3b] overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
              className="absolute top-0 left-0 h-full bg-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.8)]"
            />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Stream Logs */}
        <motion.div variants={itemVariants} className="p-6 bg-[#020202] border border-white/[0.08] relative overflow-hidden h-[300px] flex flex-col">
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30"></div>
          
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.05] relative z-20">
            <h3 className="text-[11px] font-mono text-[#888] uppercase tracking-[0.2em] flex items-center">
              <Activity size={14} className="mr-2 text-blue-400" /> Event Stream
            </h3>
            <span className="text-[9px] font-mono tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 border border-blue-400/20 uppercase flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5 animate-ping"></span>
              Live
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-3 relative z-20 pr-2">
            {logs.map((log, i) => (
              <motion.div 
                key={log.time + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start"
              >
                <span className="text-[#555] mr-3 shrink-0">[{log.time}]</span>
                <span className={`mr-2 shrink-0 ${
                  log.level === 'warn' ? 'text-amber-400' : 
                  log.level === 'success' ? 'text-[#34d399]' : 
                  'text-blue-400'
                }`}>[{log.type}]</span>
                <span className={`break-words ${
                  log.level === 'warn' ? 'text-amber-100' : 
                  log.level === 'success' ? 'text-gray-300' : 
                  'text-gray-400'
                }`}>
                  {log.msg}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Topology */}
        <motion.div variants={itemVariants} className="p-6 bg-[#020202] border border-white/[0.08] relative overflow-hidden h-[300px] flex flex-col">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-10"></div>
          
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.05] relative z-20">
            <h3 className="text-[11px] font-mono text-[#888] uppercase tracking-[0.2em] flex items-center">
              <Network size={14} className="mr-2 text-purple-400" /> Topology Map
            </h3>
            <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Routing: Optimal</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative z-20">
            <div className="flex items-center space-x-6 relative">
              {/* Background glowing rings for Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[#34d399]/5 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-dashed border-[#34d399]/10 animate-[spin_15s_linear_infinite_reverse]"></div>

              {/* Edge Node */}
              <div className="flex flex-col items-center relative group">
                <div className="w-12 h-12 bg-[#050505] border border-white/[0.1] flex items-center justify-center mb-3 relative z-10 transition-colors group-hover:border-blue-500/50">
                  <Server size={18} className="text-[#888] group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest bg-[#020202] px-2 py-1 border border-white/[0.05]">Edge</span>
              </div>
              
              {/* Connection 1 */}
              <div className="h-[1px] w-16 bg-white/[0.05] relative">
                <motion.div 
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute w-8 h-[1px] bg-gradient-to-r from-transparent via-[#34d399] to-transparent shadow-[0_0_10px_#34d399]"
                />
              </div>

              {/* Core Node */}
              <div className="flex flex-col items-center relative group">
                <div className="w-20 h-20 bg-black border border-[#34d399]/30 shadow-[inset_0_0_20px_rgba(52,211,153,0.1),0_0_15px_rgba(52,211,153,0.2)] flex items-center justify-center mb-3 z-10 relative">
                  <div className="absolute inset-0 border border-[#34d399]/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                  <Cpu size={32} className="text-[#34d399] filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <span className="text-[10px] font-mono text-[#34d399] uppercase tracking-widest bg-[#020202] px-2 py-1 border border-[#34d399]/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">Core</span>
              </div>

              {/* Connection 2 */}
              <div className="h-[1px] w-16 bg-white/[0.05] relative">
                <motion.div 
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                  className="absolute w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_10px_#a855f7]"
                />
              </div>

              {/* DB Node */}
              <div className="flex flex-col items-center relative group">
                <div className="w-12 h-12 bg-[#050505] border border-white/[0.1] flex items-center justify-center mb-3 z-10 transition-colors group-hover:border-purple-500/50">
                  <Key size={18} className="text-[#888] group-hover:text-purple-400 transition-colors" />
                </div>
                <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest bg-[#020202] px-2 py-1 border border-white/[0.05]">DB</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
