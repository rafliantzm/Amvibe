'use client'

import { useEffect, useState } from 'react'

interface MotionProfile {
  isReducedMotion: boolean
  isPointerFine: boolean
  isCompactViewport: boolean
  isLowPowerDevice: boolean
  enableEnhancedMotion: boolean
}

const DEFAULT_PROFILE: MotionProfile = {
  isReducedMotion: false,
  isPointerFine: false,
  isCompactViewport: true,
  isLowPowerDevice: false,
  enableEnhancedMotion: false,
}

export function useMotionProfile(): MotionProfile {
  const [profile, setProfile] = useState<MotionProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)')

    const updateProfile = () => {
      const isReducedMotion = reducedMotionMedia.matches
      const isPointerFine = pointerMedia.matches
      const isCompactViewport = window.innerWidth < 1024
      const hardwareThreads = typeof navigator.hardwareConcurrency === 'number'
        ? navigator.hardwareConcurrency
        : 8
      const isLowPowerDevice = hardwareThreads <= 4

      setProfile({
        isReducedMotion,
        isPointerFine,
        isCompactViewport,
        isLowPowerDevice,
        enableEnhancedMotion: !isReducedMotion && isPointerFine && !isCompactViewport && !isLowPowerDevice,
      })
    }

    updateProfile()

    window.addEventListener('resize', updateProfile, { passive: true })
    reducedMotionMedia.addEventListener('change', updateProfile)
    pointerMedia.addEventListener('change', updateProfile)

    return () => {
      window.removeEventListener('resize', updateProfile)
      reducedMotionMedia.removeEventListener('change', updateProfile)
      pointerMedia.removeEventListener('change', updateProfile)
    }
  }, [])

  return profile
}
