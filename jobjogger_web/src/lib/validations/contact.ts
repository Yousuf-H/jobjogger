import { INTERACTION_TYPES } from '@/types/contact'
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  email: z.email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedin_url: z.string().optional(),
  notes: z.string().optional(),
  organisation_id: z.number().optional().nullable(),
})

export type ContactFormValues = z.infer<typeof contactSchema>

export const interactionSchema = z.object({
  interaction_type: z.enum(INTERACTION_TYPES, {
    error: 'Please select an interaction type',
  }),
  notes: z.string().optional(),
  occurred_at: z.string().min(1, 'Date is required'),
})

export type InteractionFormValues = z.infer<typeof interactionSchema>
