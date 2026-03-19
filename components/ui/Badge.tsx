import { DIE_MAP, DieValue } from '@/lib/game/cards'

const DIE_TEXT_COLOR: Record<DieValue, string> = { 1:'#000', 2:'#000', 3:'#fff', 4:'#fff', 5:'#000', 6:'#000' }
const DIE_BG_COLOR: Record<DieValue, string>   = { 1:'#EA6CAE', 2:'#7ADDDA', 3:'#8B70CC', 4:'#3097D1', 5:'#7ADDDA', 6:'#EA6CAE' }

export function Badge({ die }: { die: DieValue }) {
  const challenge = DIE_MAP[die]
  return (
    <span className="inline-flex items-center text-[10px] font-bold rounded-full px-3 py-1"
      style={{ background: DIE_BG_COLOR[die], color: DIE_TEXT_COLOR[die] }}>
      {challenge.label}
    </span>
  )
}
