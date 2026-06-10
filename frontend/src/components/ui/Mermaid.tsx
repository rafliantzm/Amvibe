'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    fontFamily: 'var(--font-sans)',
    primaryColor: '#1a1a1a',
    primaryTextColor: '#f4f4f5',
    primaryBorderColor: '#333333',
    lineColor: '#555555',
    secondaryColor: '#27272a',
    tertiaryColor: '#111111',
  },
  securityLevel: 'loose',
  suppressErrorRendering: true,
})

export const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [svgCode, setSvgCode] = useState<string>('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!chart) return
    let isMounted = true

    const renderChart = async () => {
      try {
        setHasError(false)
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`
        
        // Temporarily suppress console.error to prevent Next.js Dev Overlay from catching Mermaid's internal parse errors
        const originalConsoleError = console.error;
        console.error = () => {};
        
        let svgContent = '';
        try {
          // Await render while console.error is muted
          const { svg } = await mermaid.render(id, chart);
          svgContent = svg;
        } finally {
          // Always restore console.error immediately after render
          console.error = originalConsoleError;
        }

        if (isMounted) {
          setSvgCode(svgContent)
        }
      } catch (error) {
        // Do NOT use console.error here. Next.js will overlay it.
        console.warn('Mermaid syntax error caught gracefully, rendering fallback UI.');
        if (isMounted) {
          setHasError(true)
        }
      }
    }

    renderChart()

    return () => {
      isMounted = false
    }
  }, [chart])

  if (hasError) {
    return (
      <div className="p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm font-mono overflow-auto">
        <strong>Diagram Error</strong>
        <pre className="mt-2 text-red-400/80">{chart}</pre>
      </div>
    )
  }

  if (!svgCode) {
    return <div className="animate-pulse h-32 bg-[#111111] rounded-xl w-full"></div>
  }

  return (
    <div 
      className="mermaid flex justify-center py-6 overflow-x-auto bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] shadow-inner mb-8"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  )
}
