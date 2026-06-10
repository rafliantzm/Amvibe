'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface FocusContextType {
  isFocused: boolean
}

const FocusContext = createContext<FocusContextType>({ isFocused: false })

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsFocused(true)
      }
    }

    const handleFocusOut = (e: Event) => {
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
      {/* Global Dimmer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] pointer-events-none transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isFocused ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isFocused ? 'scale-[0.98]' : 'scale-100'}`}>
        {children}
      </div>
    </FocusContext.Provider>
  )
}

export const useFocusContext = () => useContext(FocusContext)
