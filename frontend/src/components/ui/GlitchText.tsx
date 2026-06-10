'use client'

import React, { useState, useEffect } from 'react'

interface GlitchTextProps {
  text: string;
  className?: string;
  delay?: number; // MS before starting the decoding
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>_/'

export function GlitchText({ text, className = '', delay = 0 }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let iteration = 0
    let interval: NodeJS.Timeout | null = null

    const startDecoding = () => {
      interval = setInterval(() => {
        setDisplayText((prev) => {
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
      }, 30)
    }

    if (delay > 0) {
      setTimeout(startDecoding, delay)
    } else {
      startDecoding()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [text, delay])

  return (
    <span className={`${className} ${!isDone ? 'font-mono tracking-widest text-[#34d399]' : ''}`}>
      {displayText}
    </span>
  )
}
