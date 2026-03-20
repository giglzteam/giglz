import { getUserPlan } from '@/lib/supabase/getUserPlan'
import { PlayGame } from '@/components/game/PlayGame'

export default async function PlayPage() {
  const plan = await getUserPlan()
  return <PlayGame isPlusPro={plan === 'plus' || plan === 'pro'} />
}
