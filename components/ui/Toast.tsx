'use client'
import { useEffect } from 'react'
interface ToastProps { message: string; onDismiss: () => void }
export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => { const t = setTimeout(onDismiss, 2000); return () => clearTimeout(t) }, [onDismiss])
  return (
    <div aria-live="polite" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-surface2 border border-teal/30 rounded-full px-5 py-3 shadow-xl text-sm font-semibold animate-[slide-down_0.3s_ease-out]">
      <span className="w-6 h-6 rounded-full bg-teal text-black flex items-center justify-center text-xs font-black">✓</span>
      {message}
    </div>
  )
}
