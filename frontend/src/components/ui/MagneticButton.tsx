'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMotionProfile } from '@/lib/useMotionProfile'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function MagneticButton({ children, className = '', strength = 30 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const { enableEnhancedMotion } = useMotionProfile()

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableEnhancedMotion || !ref.current) return
    if (!ref.current) return
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    
    setPosition({ 
      x: middleX * (strength / 100), 
      y: middleY * (strength / 100) 
    })
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 })
  }

  if (!enableEnhancedMotion) {
    return <div className={`inline-block ${className}`}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-block ${className}`}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  )
}
