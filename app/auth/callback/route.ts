import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

function isSafeRedirect(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes(':')
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = isSafeRedirect(rawNext) ? rawNext : '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      // Forward any cookies set by Supabase during the exchange
      for (const cookie of cookieStore.getAll()) {
        response.cookies.set(cookie.name, cookie.value, cookie as any)
      }
      return response
    }
    console.error('[auth/callback] exchangeCodeForSession error:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=1`)
}
