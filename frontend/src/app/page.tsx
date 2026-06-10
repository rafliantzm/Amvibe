import Link from "next/link";
import { DemoLoop } from "@/components/ui/DemoLoop";
import { NeuralMesh } from "@/components/ui/NeuralMesh";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020202] text-[#ededed] selection:bg-[#34d399]/30 selection:text-[#34d399] flex flex-col font-sans overflow-x-hidden relative">
      
      {/* Global Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-[9999]" />

      {/* Cyberpunk Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <NeuralMesh />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111] to-[#222] border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ededed]">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold tracking-wide text-lg text-white">Amvibe OS</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-1 text-sm font-medium text-[#888]">
            <span className="w-4 h-3 bg-red-600 rounded-[2px] inline-block mr-1 opacity-80"></span>
            ID
          </div>
          <Link href="/login" className="text-sm font-medium text-[#888] hover:text-[#ededed] transition-colors">
            Log in
          </Link>
          <Link 
            href="/login" 
            className="text-sm font-medium px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#34d399]/30 transition-all text-[#ededed] shadow-lg shadow-black/50 hover:shadow-[#34d399]/10"
          >
            Launch Amvibe OS
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-16 lg:mb-0">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 font-serif">
              Turn ideas into<br />system architecture
            </h1>
            <p className="text-lg text-[#888] mb-10 max-w-xl leading-relaxed font-light">
              Generate comprehensive Next Step Plans and Product Requirements Documents from a simple description. AI-powered, context-aware, and export-ready for agentic execution.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/login" 
                className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full bg-[#34d399]/10 border border-[#34d399]/30 hover:bg-[#34d399]/20 hover:border-[#34d399]/50 text-[#34d399] font-medium transition-all shadow-[0_0_20px_rgba(52,211,153,0.1)] hover:shadow-[0_0_30px_rgba(52,211,153,0.2)] flex items-center justify-center"
              >
                Launch Amvibe OS <span className="ml-2">→</span>
              </Link>
              <a 
                href="#how-it-works" 
                className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[#ededed] font-medium"
              >
                See How it Works
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <DemoLoop />
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111] border border-white/5 p-8 rounded-2xl flex flex-col h-full hover:border-[#34d399]/30 hover:bg-[#141414] transition-all">
              <div className="w-10 h-10 rounded-full bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center mb-6 text-[#34d399]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l10 6.5-10 6.5-10-6.5L12 2z"/><path d="M12 22l10-6.5-10-6.5-10 6.5L12 22z"/><path d="M12 15.5L2 9l10 6.5 10-6.5-10 6.5z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-serif">Next Step Planner</h3>
              <p className="text-[#888] leading-relaxed font-light text-sm flex-1">
                Synthesize complex software goals into step-by-step technical implementation plans, defining component architecture and deep module dependencies.
              </p>
            </div>
            
            <div className="bg-[#111] border border-white/5 p-8 rounded-2xl flex flex-col h-full hover:border-[#34d399]/30 hover:bg-[#141414] transition-all">
              <div className="w-10 h-10 rounded-full bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center mb-6 text-[#34d399]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-serif">PRD Generator</h3>
              <p className="text-[#888] leading-relaxed font-light text-sm flex-1">
                Instantly turn your product vision into professional Product Requirements Documents with detailed user personas, scoping, and business logic.
              </p>
            </div>
            
            <div className="bg-[#111] border border-white/5 p-8 rounded-2xl flex flex-col h-full hover:border-[#34d399]/30 hover:bg-[#141414] transition-all">
              <div className="w-10 h-10 rounded-full bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center mb-6 text-[#34d399]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-serif">Agentic Coding Prompts</h3>
              <p className="text-[#888] leading-relaxed font-light text-sm flex-1">
                Extract terminal-ready prompt files that feed directly into Claude, Cursor, or your favorite AI coding agents for immediate execution.
              </p>
            </div>
          </div>
        </section>

        {/* Structured Flow Section */}
        <section className="w-full max-w-4xl mx-auto px-6 py-32 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-serif tracking-tight">Structured Flow, Zero Friction</h2>
          <p className="text-[#888] text-lg mb-20 max-w-2xl mx-auto font-light leading-relaxed">
            From a fuzzy thought to a high-fidelity blueprint. How our platform guides you from draft to handoff.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-white/10 pt-10 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[40px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#34d399]/50 to-transparent"></div>
            
            <div className="relative pt-6">
              <div className="absolute top-0 left-0 text-xs font-mono text-[#34d399] bg-[#050505] pr-4 z-10 -mt-[10px]">01</div>
              <h4 className="text-lg font-bold text-white mb-2 font-serif">Input App Vision</h4>
              <p className="text-[#666] text-sm leading-relaxed">Provide your raw application idea. The AI ingests the concept, dissecting user roles, core functions, and tech stack preferences.</p>
            </div>
            <div className="relative pt-6">
              <div className="absolute top-0 left-0 text-xs font-mono text-[#34d399] bg-[#050505] pr-4 z-10 -mt-[10px]">02</div>
              <h4 className="text-lg font-bold text-white mb-2 font-serif">AI Synthesizes Blueprint</h4>
              <p className="text-[#666] text-sm leading-relaxed">Amvibe OS crunches the data to produce high-fidelity PRDs and systematic implementation plans with robust component mapping.</p>
            </div>
            <div className="relative pt-6">
              <div className="absolute top-0 left-0 text-xs font-mono text-[#34d399] bg-[#050505] pr-4 z-10 -mt-[10px]">03</div>
              <h4 className="text-lg font-bold text-white mb-2 font-serif">Execute with Agents</h4>
              <p className="text-[#666] text-sm leading-relaxed">Export raw prompt scripts into your local terminal. Let autonomous agents like Cursor build the actual codebase from your blueprint.</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32 flex flex-col items-center text-center border-t border-white/5">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-serif">Build with Clear Intent</h2>
          <p className="text-[#888] text-lg mb-10 max-w-xl mx-auto font-light">
            Stop writing code from blank slates. Let AI construct the scaffold while you govern the vision.
          </p>
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-full bg-[#34d399]/10 border border-[#34d399]/30 hover:bg-[#34d399]/20 hover:border-[#34d399]/50 text-[#34d399] font-medium transition-all shadow-[0_0_20px_rgba(52,211,153,0.1)] hover:shadow-[0_0_30px_rgba(52,211,153,0.2)] flex items-center justify-center"
          >
            Launch Amvibe OS <span className="ml-2">→</span>
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#555]">
        <div className="mb-4 sm:mb-0">
          Open source framework • Developed using Next.js & Supabase
        </div>
        <div className="flex items-center">
          <span className="w-3 h-2 bg-red-600 rounded-[1px] inline-block mr-1 opacity-80"></span>
          Bahasa Indonesia
        </div>
      </footer>
    </div>
  );
}
