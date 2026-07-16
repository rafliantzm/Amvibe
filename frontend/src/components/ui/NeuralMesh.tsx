'use client'

import React, { useEffect, useRef } from 'react'
import { useMotionProfile } from '@/lib/useMotionProfile'

interface NeuralMeshProps {
  className?: string
}

export function NeuralMesh({ className = '' }: NeuralMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { enableEnhancedMotion, isCompactViewport, isLowPowerDevice, isPointerFine, isReducedMotion } = useMotionProfile()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let lastFrameAt = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let pixelRatio = 1
    const nodeCount = isReducedMotion
      ? 14
      : isCompactViewport
        ? 18
        : isLowPowerDevice
          ? 22
          : enableEnhancedMotion
            ? 32
            : 26
    const maxFps = enableEnhancedMotion ? 30 : 20
    const linkDistance = enableEnhancedMotion ? 140 : 115
    const linkDistanceSq = linkDistance * linkDistance
    const repulsionDistanceSq = 150 * 150
    const shouldTrackMouse = isPointerFine && !isReducedMotion

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    window.addEventListener('resize', resize, { passive: true })
    resize()

    const nodes = Array.from({ length: nodeCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1
    }))

    const mouse = { x: -1000, y: -1000 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    
    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    if (shouldTrackMouse) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('mouseleave', handleMouseLeave)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        const dx = mouse.x - node.x
        const dy = mouse.y - node.y
        const distSq = dx * dx + dy * dy
        if (shouldTrackMouse && distSq < repulsionDistanceSq) {
          node.x -= dx * 0.02
          node.y -= dy * 0.02
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(52, 211, 153, 0.3)' // Emerald
        ctx.fill()
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distSq = dx * dx + dy * dy

          if (distSq < linkDistanceSq) {
            const dist = Math.sqrt(distSq)
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(168, 85, 247, ${1 - dist / linkDistance})` // Purple
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const animate = (timestamp: number) => {
      if (document.visibilityState !== 'visible') {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      if (timestamp - lastFrameAt >= 1000 / maxFps) {
        lastFrameAt = timestamp
        draw()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (shouldTrackMouse) {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseleave', handleMouseLeave)
      }
      cancelAnimationFrame(animationFrameId)
    }
  }, [enableEnhancedMotion, isCompactViewport, isLowPowerDevice, isPointerFine, isReducedMotion])

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen ${className}`}
    />
  )
}
