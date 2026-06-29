import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Plus } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { useTimelineEntryActions } from '@/hooks/useTimelineEntryActions'
import {
  timelineEntrySchema,
  type TimelineEntryFormValues,
} from '@/lib/validations/timelineEntry'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface AddTimelineEntryDialogProps {
  jobId: number
  entry?: TimelineEntry
  mode?: 'create' | 'edit'
  trigger?: ReactNode
}

export default function AddTimelineEntryDialog({
  jobId,
  entry,
  mode = 'create',
  trigger,
}: AddTimelineEntryDialogProps) {
  const [open, setOpen] = useState(false)

  function getLocalDateInputValue(date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const form = useForm<TimelineEntryFormValues>({
    resolver: zodResolver(timelineEntrySchema),
    defaultValues: entry
      ? {
          entry_type: entry.entry_type as TimelineEntryFormValues['entry_type'],
          description: entry.description,
          occurred_at: entry.occurred_at.split('T')[0],
        }
      : {
          entry_type: 'note',
          description: '',
          occurred_at: getLocalDateInputValue(),
        },
  })

  const { createMutation, updateMutation } = useTimelineEntryActions({
    jobId,
    onCreateSuccess: () => {
      form.reset()
      setOpen(false)
    },
    onUpdateSuccess: () => {
      setOpen(false)
    },
  })

  const onSubmit = (data: TimelineEntryFormValues) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const resolvedData = {
      ...data,
      occurred_at: mode === 'create' && data.occurred_at === today ? new Date().toISOString() : data.occurred_at,
    }
    if (mode === 'edit' && entry) {
      updateMutation.mutate({ entryId: entry.id, data: resolvedData })
    } else {
      createMutation.mutate(resolvedData)
    }
  }

  const mutation = mode === 'edit' ? updateMutation : createMutation

  const descriptionLength = (form.watch('description') ?? '').length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="default">
            <Plus className="h-3.5 w-3.5" />
            Log entry
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit entry' : 'Log entry'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === 'edit'
              ? 'Update this timeline entry.'
              : 'Log a new activity on this job application.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Entry Type */}
            <FormField
              control={form.control}
              name="entry_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-[5px] text-[11px] font-medium text-muted-foreground">
                    Entry Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-[7px] border-[0.5px] border-input">
                        <SelectValue placeholder="Select entry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="occurred_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-[5px] text-[11px] font-medium text-muted-foreground">
                    Date
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <Input
                        type="date"
                        className="rounded-[7px] border-[0.5px] border-input pl-9 cursor-pointer"
                        max="9999-12-31"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description — counter lives outside FormItem to avoid space-y-2 gap */}
            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-[5px] text-[11px] font-medium text-muted-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Had phone screen with hiring manager..."
                        rows={4}
                        maxLength={1000}
                        className="rounded-[7px] border-[0.5px] border-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {descriptionLength} / 1000 characters
              </p>
            </div>

            <Button
              type="submit"
              variant="default"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending
                ? mode === 'edit'
                  ? 'Saving...'
                  : 'Adding...'
                : mode === 'edit'
                  ? 'Save changes'
                  : 'Log entry'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
