'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleMagicLink() {
    setLoading(true)
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
    setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center p-6 gap-6">
      <div className="font-display font-black text-2xl bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">GiGLz</div>
      {sent ? (
        <div className="text-center">
          <div className="text-2xl mb-3">✉️</div>
          <div className="font-display font-black text-lg mb-2">Check your email</div>
          <div className="text-sm text-[var(--text-secondary)]">We sent a magic link to {email}</div>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <h1 className="font-display font-black text-xl mb-1">Create your account</h1>
            <p className="text-sm text-[var(--text-secondary)]">Free to start. No card required.</p>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest block mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-surface2 border border-[var(--border)] rounded-xl px-4 h-12 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-teal focus:shadow-[0_0_0_3px_var(--teal-glow)] transition-all" />
          </div>
          <Button variant="primary" onClick={handleMagicLink} disabled={loading || !email} className="w-full rounded-2xl">
            {loading ? 'Sending…' : 'Send Magic Link'}
          </Button>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex-1 h-px bg-[var(--border)]" />or<div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          <Button variant="secondary" onClick={handleGoogle} className="w-full rounded-2xl">Continue with Google</Button>
          <p className="text-center text-xs text-[var(--text-muted)]">Already have an account? <a href="/login" className="text-teal hover:underline">Sign in</a></p>
        </div>
      )}
    </div>
  )
}
