import { z } from 'zod'

export const timelineEntrySchema = z.object({
  entry_type: z.enum([
    'note',
    'contact',
    'interview',
    'assessment',
    'follow_up',
  ]),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  occurred_at: z.string().min(1, 'Date is required'),
})

export type TimelineEntryFormValues = z.infer<typeof timelineEntrySchema>
