import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}: ConfirmModalProps) {
  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Option to scale down main content for spatial depth
      const main = document.getElementById('main-app-content')
      if (main) {
        main.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s'
        main.style.transform = 'scale(0.98)'
        main.style.opacity = '0.5'
      }
    } else {
      document.body.style.overflow = 'unset'
      const main = document.getElementById('main-app-content')
      if (main) {
        main.style.transform = 'scale(1)'
        main.style.opacity = '1'
      }
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (typeof document === 'undefined') return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#000]/60 backdrop-blur-xl"
            onClick={onCancel}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/[0.08] rounded-[32px] shadow-2xl overflow-hidden p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
          >
            {/* Close Button */}
            <button 
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 text-[#666] hover:text-[#ededed] hover:bg-white/[0.05] rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <AlertTriangle size={24} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-bold tracking-tight text-[#ededed] mb-2">{title}</h3>
              <p className="text-[14px] text-[#888] font-light leading-relaxed mb-8 px-4">
                {message}
              </p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-[13px] bg-white/[0.03] text-[#ededed] hover:bg-white/[0.08] border border-white/[0.05] transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium text-[13px] transition-all ${
                    isDestructive 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                      : 'bg-[#34d399] hover:bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
