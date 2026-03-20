'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CheckoutButtonProps {
  plan: 'plus' | 'pro'
  variant: 'primary' | 'pink'
  label: string
  disabled?: boolean
}

export function CheckoutButton({ plan, variant, label, disabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading || disabled) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  if (disabled) {
    return (
      <Button variant={variant} className="w-full opacity-60 cursor-default" disabled>
        Current Plan
      </Button>
    )
  }

  return (
    <Button variant={variant} className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? 'Loading…' : label}
    </Button>
  )
}
