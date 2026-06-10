'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const childRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseEnter = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect()
      
      let x = 0
      let y = 0
      
      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2
          y = rect.top - 8
          break
        case 'bottom':
          x = rect.left + rect.width / 2
          y = rect.bottom + 8
          break
        case 'left':
          x = rect.left - 8
          y = rect.top + rect.height / 2
          break
        case 'right':
          x = rect.right + 8
          y = rect.top + rect.height / 2
          break
      }
      
      setCoords({ x, y })
    }
    setIsVisible(true)
  }

  const getTransform = () => {
    switch (position) {
      case 'top': return 'translate(-50%, -100%)'
      case 'bottom': return 'translate(-50%, 0)'
      case 'left': return 'translate(-100%, -50%)'
      case 'right': return 'translate(0, -50%)'
    }
  }

  return (
    <div 
      ref={childRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
      className="inline-block relative"
    >
      {children}
      {mounted && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: coords.x,
                top: coords.y,
                transform: getTransform(),
                pointerEvents: 'none',
                zIndex: 99999
              }}
              className="bg-[#0a0a0a] border border-white/[0.08] text-[#ededed] px-2.5 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap shadow-xl"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
