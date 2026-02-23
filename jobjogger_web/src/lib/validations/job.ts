import { z } from 'zod'

export const createJobSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  status: z.enum([
    'wishlist',
    'applied',
    'phone_screen',
    'interviewing',
    'offer',
    'accepted',
    'rejected',
    'ghosted',
    'withdrawn',
  ]),
  job_url: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  employment_type: z
    .enum(['full_time', 'part_time', 'casual', 'contract'])
    .optional(),
  salary_range: z.string().optional().or(z.literal('')),
  source: z
    .enum(['seek', 'linkedin', 'referral', 'company_site', 'other'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.string().optional().or(z.literal('')),
})

export type CreateJobFormInput = z.input<typeof createJobSchema>
export type CreateJobFormValues = z.infer<typeof createJobSchema>
