'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function ManageButton() {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" onClick={handleManage} disabled={loading} className="text-sm">
      {loading ? 'Loading…' : 'Manage subscription →'}
    </Button>
  )
}
