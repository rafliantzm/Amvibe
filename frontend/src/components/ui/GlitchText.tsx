'use client'

import React, { useState, useEffect } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
  delay?: number // MS before starting the decoding
  speed?: number // Multiplier for decode cadence
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>_/'

export function GlitchText({ text, className = '', delay = 0, speed = 1 }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let iteration = 0
    let interval: NodeJS.Timeout | null = null
    let timeout: NodeJS.Timeout | null = null
    const safeSpeed = Math.max(speed, 0.1)
    const frameMs = Math.max(16, Math.round(30 / safeSpeed))

    const startDecoding = () => {
      setIsDone(false)
      interval = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index]
              }
              // Don't glitch spaces
              if (letter === ' ') return ' '
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        })

        if (iteration >= text.length) {
          clearInterval(interval!)
          setIsDone(true)
        }

        iteration += 1 / 3 // Controls speed of decoding
      }, frameMs)
    }

    if (delay > 0) {
      timeout = setTimeout(startDecoding, delay)
    } else {
      startDecoding()
    }

    return () => {
      if (interval) clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    }
  }, [text, delay, speed])

  return (
    <span className={`${className} ${!isDone ? 'font-mono tracking-widest text-[#34d399]' : ''}`}>
      {displayText}
    </span>
  )
}
