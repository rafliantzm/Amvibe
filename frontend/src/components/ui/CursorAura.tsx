'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export function CursorAura() {
  const [mounted, setMounted] = useState(false)
  
  // Use framer-motion springs for fluid, physics-based movement
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const mouseX = useSpring(0, springConfig)
  const mouseY = useSpring(0, springConfig)

  useEffect(() => {
    setMounted(true)
    
    // Initial position center of screen
    mouseX.set(window.innerWidth / 2)
    mouseY.set(window.innerHeight / 2)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  if (!mounted) return null

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9998] w-64 h-64 bg-[#34d399]/[0.08] rounded-full blur-[80px]"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />
  )
}
