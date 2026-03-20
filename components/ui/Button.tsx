import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'pink' | 'secondary' | 'roll' | 'correct' | 'skip'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant }

const variants: Record<Variant, string> = {
  primary:   'bg-teal text-black font-display font-black tracking-wide shadow-[0_0_28px_var(--teal-glow)] hover:shadow-[0_0_40px_var(--teal-glow)] active:scale-95',
  pink:      'bg-pink text-white font-display font-black tracking-wide shadow-[0_0_28px_var(--pink-glow)] active:scale-95',
  secondary: 'bg-transparent text-white border border-[var(--border-hover)] font-semibold hover:bg-white/5 active:scale-95',
  roll:      'w-full bg-gradient-to-br from-purple to-blue text-white font-display font-black tracking-widest shadow-[0_0_32px_var(--purple-glow)] active:scale-95 rounded-2xl',
  correct:   'flex-[2] bg-teal text-black font-display font-black tracking-wide shadow-[0_0_24px_var(--teal-glow)] active:scale-95 rounded-2xl',
  skip:      'flex-1 bg-surface2 text-[var(--text-secondary)] border border-[var(--border)] font-semibold active:scale-95 rounded-2xl',
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 min-h-[48px] md:min-h-[56px] px-6 md:px-8 md:text-base rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)}
      {...props}
    >{children}</button>
  )
}
