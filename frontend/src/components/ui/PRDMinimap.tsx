'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, GripHorizontal } from 'lucide-react'

interface MinimapProps {
  contentRef: React.RefObject<HTMLDivElement>
}

export function PRDMinimap({ contentRef }: MinimapProps) {
  const [headings, setHeadings] = useState<{ id: string, text: string, level: number, active: boolean }[]>([])
  const [isOpen, setIsOpen] = useState(true)

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

    // Small delay to ensure markdown is rendered
    setTimeout(updateHeadings, 500)

    const handleScroll = () => {
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

      setHeadings(prev => prev.map(h => ({
        ...h,
        active: h.id === currentId
      })))
    }

    // Attach scroll listener to the main scroll container
    const scrollContainer = document.querySelector('.flex-1.overflow-auto') || window
    scrollContainer.addEventListener('scroll', handleScroll)
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [contentRef])

  if (headings.length === 0) return null

  return (
    <motion.div 
      drag 
      dragMomentum={false}
      className="hidden xl:block fixed right-8 top-20 w-48 z-40 cursor-grab active:cursor-grabbing"
    >
      <div className="bg-[#030303]/50 backdrop-blur-md border border-white/[0.05] rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 text-[11px] font-mono">
        
        {/* Header / Toggle Button */}
        <div className="w-full flex items-center justify-between p-4 text-[#555] hover:text-[#ededed] transition-colors border-b border-transparent hover:bg-white/[0.02]" style={{ borderBottomColor: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
          <div className="uppercase tracking-widest flex items-center shrink-0">
            <GripHorizontal className="h-3 w-3 mr-2 opacity-50" />
            <span className="text-[#34d399] mr-2">/</span> Map
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="space-y-2 relative p-4 pt-2">
                {/* Active tracking line */}
                <div className="absolute left-4 top-2 bottom-4 w-[1px] bg-white/[0.05]">
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

                {headings.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const el = document.getElementById(h.id)
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
