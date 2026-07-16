'use client'

import React, { useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'
import { useMotionProfile } from '@/lib/useMotionProfile'

export function CursorAura() {
  const { enableEnhancedMotion } = useMotionProfile()
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const mouseX = useSpring(0, springConfig)
  const mouseY = useSpring(0, springConfig)

  useEffect(() => {
    if (!enableEnhancedMotion) {
      return
    }

    // Initial position center of screen
    mouseX.set(window.innerWidth / 2)
    mouseY.set(window.innerHeight / 2)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enableEnhancedMotion, mouseX, mouseY])

  if (!enableEnhancedMotion) {
    return null
  }

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9998] w-64 h-64 bg-[#34d399]/[0.08] rounded-full blur-[80px]"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%',
        willChange: 'transform',
      }}
    />
  )
}
