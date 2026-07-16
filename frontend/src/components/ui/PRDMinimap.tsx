'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface MinimapProps {
  contentRef: React.RefObject<HTMLDivElement | null>
}

export function PRDMinimap({ contentRef }: MinimapProps) {
  const [headings, setHeadings] = useState<{ id: string, text: string, level: number, active: boolean }[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const activeHeadingRef = useRef('')
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!contentRef.current) return

    const updateHeadings = () => {
      if (!contentRef.current) return
      const elements = Array.from(contentRef.current.querySelectorAll('h1, h2, h3'))
      const newHeadings = elements.map(el => {
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString()
        }
        return {
          id: el.id,
          text: el.textContent || '',
          level: parseInt(el.tagName[1]),
          active: false
        }
      })
      setHeadings(newHeadings)
    }

    const headingTimeout = window.setTimeout(updateHeadings, 500)

    const handleScroll = () => {
      if (frameRef.current !== null) {
        return
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        if (!contentRef.current) return
        const scrollPosition = window.scrollY || contentRef.current.scrollTop
        
        const elements = Array.from(contentRef.current.querySelectorAll('h1, h2, h3'))
        let currentId = ''
        
        elements.forEach((el) => {
          const top = (el as HTMLElement).offsetTop
          if (scrollPosition >= top - 150) {
            currentId = el.id
          }
        })

        if (currentId === activeHeadingRef.current) {
          return
        }

        activeHeadingRef.current = currentId
        setHeadings(prev => prev.map(h => ({
          ...h,
          active: h.id === currentId
        })))
      })
    }

    const scrollContainer = contentRef.current.closest('.overflow-y-auto') ?? window

    if ('addEventListener' in scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    }

    handleScroll()
    
    return () => {
      window.clearTimeout(headingTimeout)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
      if ('removeEventListener' in scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [contentRef])

  if (headings.length === 0) return null

  return (
    <>
      {/* Right Edge Trigger (Invisible + Visible Handle) */}
      {!isOpen && (
        <div 
          className="fixed top-0 right-0 w-6 md:w-8 h-full z-50 cursor-pointer group/edge flex items-center justify-end"
          onClick={() => setIsOpen(true)}
          title="Open Map"
        >
          <div className="absolute right-0 w-1.5 group-hover/edge:w-2 h-16 md:h-20 bg-[#34d399]/20 group-hover/edge:bg-[#34d399]/40 transition-all duration-300 rounded-l-xl backdrop-blur-md shadow-[-2px_0_10px_rgba(52,211,153,0.2)] border-y border-l border-[#34d399]/20 flex items-center justify-center">
            {/* Subtle visual indicator inside the handle */}
            <div className="w-[1px] h-6 bg-white/30 rounded-full" />
            
            {/* Expand icon appearing on hover/active */}
            <div className="absolute right-full mr-1 opacity-0 group-hover/edge:opacity-100 md:opacity-0 transition-all duration-300 translate-x-2 group-hover/edge:translate-x-0 pointer-events-none flex items-center justify-center w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#34d399]/80">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar Backdrop (Mobile/Tablet only) */}
      {isOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Right Sidebar */}
      <div className={`
        fixed top-0 right-0 z-40 h-full
        py-4 pr-4 pl-4 xl:pl-0 
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0
        ${isOpen 
          ? 'translate-x-0 w-[280px]' 
          : 'translate-x-full xl:translate-x-0 w-[280px] xl:w-0 xl:opacity-0 xl:overflow-hidden xl:!p-0'
        }
      `}>
        <aside className="h-full rounded-[24px] border border-white/[0.04] bg-black/40 backdrop-blur-3xl saturate-[1.5] flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] overflow-hidden relative z-10 text-[11px] font-mono">
          
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 min-w-[240px]">
            <div className="uppercase tracking-widest flex items-center shrink-0 text-[#555]">
              <span className="text-[#34d399] mr-2">/</span> MAP
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#666] hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation List */}
          <div className="flex-1 overflow-y-auto px-4 mt-2 pb-6 min-w-[240px] no-scrollbar relative">
            {/* Active tracking line */}
            <div className="absolute left-4 top-0 bottom-6 w-[1px] bg-white/[0.05]">
              <motion.div 
                className="w-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                initial={false}
                animate={{ 
                  height: headings.some(h => h.active) ? 12 : 0,
                  y: headings.findIndex(h => h.active) * 20 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            <div className="space-y-0">
              {headings.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = document.getElementById(h.id)
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                    if (window.innerWidth < 1280) setIsOpen(false)
                  }}
                  className={`block w-full text-left truncate transition-all pl-3 ${
                    h.level === 1 ? 'font-bold' : h.level === 2 ? 'pl-5' : 'pl-7'
                  } ${h.active ? 'text-[#34d399]' : 'text-[#666] hover:text-[#ededed]'}`}
                  style={{ height: '20px', lineHeight: '20px' }}
                >
                  {h.text}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
