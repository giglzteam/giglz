import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
interface PaywallGateProps { onDismiss: () => void }
export function PaywallGate({ onDismiss }: PaywallGateProps) {
  return (
    <Modal onClose={onDismiss}>
      <div className="bg-surface1 border border-[var(--border)] rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(122,221,218,0.1), transparent)' }} />
        <div className="w-14 h-14 bg-surface2 border border-[var(--border)] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 stroke-teal" fill="none" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="font-display font-black text-lg mb-2">Keep the Party Going!</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">Upgrade to Plus to unlock the full game.</p>
        <ul className="text-left space-y-2 mb-6">
          {['100 cards', 'Timer', 'Team mode', 'Unlimited players'].map(f => (
            <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="w-4 h-4 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-[9px] text-teal font-bold shrink-0">✓</span>{f}
            </li>
          ))}
        </ul>
        <p className="font-display font-black text-2xl mb-1">€2.99 <span className="text-sm text-[var(--text-secondary)] font-sans font-normal">/ month</span></p>
        <a href="/pricing" className="block w-full mt-4"><Button variant="primary" className="w-full rounded-2xl text-sm font-display">Unlock Plus Now</Button></a>
        <button onClick={onDismiss} className="mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer">Continue free game →</button>
      </div>
    </Modal>
  )
}
