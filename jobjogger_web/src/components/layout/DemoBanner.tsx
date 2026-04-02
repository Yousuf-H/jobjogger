import { useAuth } from '@/hooks/useAuth'
import { Info } from 'lucide-react'

export default function DemoBanner() {
  const { user } = useAuth()

  if (!user?.demo) return null

  return (
    <div className="bg-primary/10 border-primary/20 border-b px-4 py-2">
      <div className="flex items-center justify-center gap-2">
        <Info className="text-primary h-4 w-4 shrink-0" />
        <p className="text-primary text-xs font-medium">
          You are viewing a demo account. Profile changes are disabled and data
          resets daily.
        </p>
      </div>
    </div>
  )
}
