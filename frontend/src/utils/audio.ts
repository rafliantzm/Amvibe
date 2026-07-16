'use client'

// Singleton AudioContext to prevent creating multiple contexts
let audioCtx: AudioContext | null = null

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext
    if (!AudioContextCtor) return null
    audioCtx = new AudioContextCtor()
  }
  return audioCtx
}

export function playWhoosh() {
  const ctx = getAudioContext()
  if (!ctx) return

  // Resume context if suspended (browser auto-play policy)
  if (ctx.state === 'suspended') ctx.resume()

  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  // Noise-like whoosh using high frequency drop
  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, t)
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.3)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2000, t)
  filter.frequency.exponentialRampToValueAtTime(100, t + 0.3)

  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.05, t + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(t)
  osc.stop(t + 0.3)
}

export function playClick() {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') ctx.resume()

  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'square'
  osc.frequency.setValueAtTime(300, t)
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.05)

  gain.gain.setValueAtTime(0.02, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(t)
  osc.stop(t + 0.05)
}
