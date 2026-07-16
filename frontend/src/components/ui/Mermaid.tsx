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
  securityLevel: 'strict',
  suppressErrorRendering: true,
})

const sanitizeMermaid = (code: string) => {
  if (!code) return ''
  let clean = code

  // 1. Fix unquoted subgraphs with spaces (e.g. `subgraph Edge Layer` -> `subgraph sg_1 ["Edge Layer"]`)
  let sgCounter = 0;
  clean = clean.replace(/subgraph\s+([^"\[\n]+)$/gm, (match, p1) => {
    const trimmed = p1.trim()
    if (trimmed.includes(' ') || /[()&/'\\]/.test(trimmed)) {
      sgCounter++;
      return `subgraph sg_${sgCounter} ["${trimmed}"]`
    }
    return match
  })

  // 2. Fix unquoted node labels with special characters
  clean = clean.replace(/([A-Za-z0-9_]+)\[([^"\]]+)\]/g, (match, id, label) => {
    const l = label.trim()
    if (/[()&/'\\]/.test(l)) {
      return `${id}["${l}"]`
    }
    return match
  })

  // 3. Fix sequence-diagram style arrows in flowcharts (A --> B: Text)
  if (clean.includes('graph ') || clean.includes('flowchart ')) {
    clean = clean.replace(/([A-Za-z0-9_]+)\s*(?:-->|->)\s*([A-Za-z0-9_]+)\s*:\s*(.+)$/gm, '$1 -->|$3| $2')
  }

  // 4. Safely convert `A -- text --> B` to `A -->|text| B`
  clean = clean.replace(/([A-Za-z0-9_]+)\s+--\s+(.+?)\s+-->\s+([A-Za-z0-9_]+)/g, '$1 -->|$2| $3')

  return clean
}

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
        
        const cleanChart = sanitizeMermaid(chart)

        // Temporarily suppress console.error to prevent Next.js Dev Overlay from catching Mermaid's internal parse errors
        const originalConsoleError = console.error;
        console.error = () => {};
        
        let svgContent = '';
        try {
          // Await render while console.error is muted
          const { svg } = await mermaid.render(id, cleanChart);
          svgContent = svg;
        } finally {
          // Always restore console.error immediately after render
          console.error = originalConsoleError;
        }

        if (isMounted) {
          setSvgCode(svgContent)
        }
      } catch {
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
    <div className="w-full min-w-0 overflow-x-auto bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] shadow-inner mb-8">
      <div 
        className="mermaid min-w-max md:min-w-full p-4 md:p-6 flex items-center justify-center"
        ref={ref}
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
    </div>
  )
}
