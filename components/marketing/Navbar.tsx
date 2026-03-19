'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display font-black bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent text-xl tracking-widest">
          GiGLz
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors min-h-[48px] flex items-center"
          >
            Sign In
          </Link>
          <Link href="/play">
            <Button variant="primary" className="text-sm">Play Free →</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 min-h-[48px] min-w-[48px] items-center justify-center cursor-pointer"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="block w-6 h-[2px] bg-[var(--text-primary)] transition-all" />
          <span className="block w-6 h-[2px] bg-[var(--text-primary)] transition-all" />
          <span className="block w-6 h-[2px] bg-[var(--text-primary)] transition-all" />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-surface1 border-b border-[var(--border)] px-6 py-4 flex flex-col gap-3">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="min-h-[48px] flex items-center text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link href="/play" onClick={() => setOpen(false)}>
            <Button variant="primary" className="w-full text-sm">Play Free →</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
