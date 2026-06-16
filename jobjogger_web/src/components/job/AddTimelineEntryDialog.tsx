import { zodResolver } from '@hookform/resolvers/zod'
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

import {
  Dialog,
  DialogContent,
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
    if (mode === 'edit' && entry) {
      updateMutation.mutate({ entryId: entry.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const mutation = mode === 'edit' ? updateMutation : createMutation

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="flex items-center gap-1.5 rounded-[7px] bg-[#2563EB] px-[14px] py-[7px] text-[12px] font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Add Entry
          </button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Timeline Entry' : 'Add Timeline Entry'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Entry Type */}
            <FormField
              control={form.control}
              name="entry_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium text-[#6B7280] mb-[5px]">
                    Entry Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[0.5px] border-[#E5E7EB] rounded-[7px]">
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
                  <FormLabel className="text-[11px] font-medium text-[#6B7280] mb-[5px]">
                    Date
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <Input
                        type="date"
                        className="border-[0.5px] border-[#E5E7EB] rounded-[7px] pl-9 cursor-pointer"
                        max="9999-12-31"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium text-[#6B7280] mb-[5px]">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Had phone screen with hiring manager..."
                      rows={4}
                      maxLength={1000}
                      className="border-[0.5px] border-[#E5E7EB] rounded-[7px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {field.value?.length || 0} / 1000 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-[7px] bg-[#2563EB] py-[8px] text-[13px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {mutation.isPending
                ? mode === 'edit'
                  ? 'Saving...'
                  : 'Adding...'
                : mode === 'edit'
                  ? 'Save Changes'
                  : 'Add Entry'}
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
