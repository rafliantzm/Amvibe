'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface FocusContextType {
  isFocused: boolean
}

const FocusContext = createContext<FocusContextType>({ isFocused: false })

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const handleFocusIn = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsFocused(true)
      }
    }

    const handleFocusOut = () => {
      setIsFocused(false)
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return (
    <FocusContext.Provider value={{ isFocused }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocusContext = () => useContext(FocusContext)
