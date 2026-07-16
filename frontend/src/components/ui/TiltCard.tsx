'use client'

import React, { useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useMotionProfile } from '@/lib/useMotionProfile'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number // Higher = more tilt
}

export function TiltCard({ children, className = '', intensity = 15 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { enableEnhancedMotion } = useMotionProfile()
  
  const x = useSpring(0, { stiffness: 300, damping: 30 })
  const y = useSpring(0, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity])
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity])
  const glare = useTransform(
    () => `radial-gradient(circle at ${(x.get() + 0.5) * 100}% ${(y.get() + 0.5) * 100}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableEnhancedMotion || !ref.current) return
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    
    // Calculate mouse position relative to center of card (-0.5 to 0.5)
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  if (!enableEnhancedMotion) {
    return (
      <div className={`relative ${className}`}>
        <div className="h-full w-full">
          {children}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
    >
      {/* Optional specular highlight/glare that moves based on tilt */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-overlay"
        style={{
          background: glare
        }}
      />
      
      {/* Content wrapper with Z-translation for 3D depth */}
      <div style={{ transform: 'translateZ(20px)' }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  )
}
