import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { invalidateJobQueries } from '@/lib/invalidation'
import { updateTimelineEntry } from '@/services/api/timelineEntries'
import type { TimelineEntry } from '@/types/timelineEntry'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EditEntryDateDialogProps {
  entry: TimelineEntry
  trigger: React.ReactNode
}

export default function EditEntryDateDialog({ entry, trigger }: EditEntryDateDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(entry.occurred_at.split('T')[0])
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  useEffect(() => {
    setDate(entry.occurred_at.split('T')[0])
  }, [entry.occurred_at])

  const updateMutation = useMutation({
    mutationFn: () => updateTimelineEntry(entry.id, { occurred_at: date }),
    onSuccess: () => {
      invalidateJobQueries(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics(userId) })
      toast.success('Date updated')
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to update date')
    },
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setDate(entry.occurred_at.split('T')[0])
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>Edit date</DialogTitle>
          <DialogDescription className="sr-only">
            Update when this status change occurred.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-[5px] block text-[11px] font-medium text-muted-foreground">
              Date
            </Label>
            <div className="relative">
              <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                type="date"
                className="pl-9 cursor-pointer"
                max="9999-12-31"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="w-full"
            disabled={updateMutation.isPending || !date}
            onClick={() => updateMutation.mutate()}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
