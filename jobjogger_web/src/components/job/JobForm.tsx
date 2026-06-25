import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getStatusConfig, STATUS_CONFIG } from '@/lib/statusConfig'
import {
  createJobSchema,
  type CreateJobFormValues,
} from '@/lib/validations/job'
import { TERMINAL_STATUSES, type JobStatus } from '@/types/job'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string
  onChange: (v: string) => void
}

function DateInput({ value, onChange, ...props }: DateInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val) {
      const year = val.split('-')[0]
      if (year.length > 4) return
    }
    onChange(val)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <CalendarIcon
        className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer"
        onClick={() => wrapperRef.current?.querySelector('input')?.showPicker?.()}
      />
      <Input
        type="date"
        className="pl-9 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
        value={value}
        onChange={handleChange}
        max="9999-12-31"
        {...props}
      />
    </div>
  )
}

const ALL_STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))

interface JobFormProps {
  onSubmit: (data: CreateJobFormValues) => void
  defaultValues?: Partial<CreateJobFormValues>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function JobForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode = 'create',
}: JobFormProps) {
  const [showDetails, setShowDetails] = useState(mode === 'edit')

  const statusOptions =
    mode === 'edit' && defaultValues?.status === 'wishlist'
      ? ALL_STATUS_OPTIONS.filter(o => !TERMINAL_STATUSES.includes(o.value as JobStatus))
      : ALL_STATUS_OPTIONS

  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      company_name: defaultValues?.company_name ?? '',
      job_title: defaultValues?.job_title ?? '',
      status: defaultValues?.status ?? 'wishlist',
      job_url: defaultValues?.job_url ?? '',
      location: defaultValues?.location ?? '',
      employment_type: defaultValues?.employment_type,
      salary_range: defaultValues?.salary_range ?? '',
      source: defaultValues?.source,
      source_other: defaultValues?.source_other ?? '',
      priority: defaultValues?.priority,
      tags: defaultValues?.tags ?? '',
      date_applied: defaultValues?.date_applied ?? '',
      follow_up_date: defaultValues?.follow_up_date ?? '',
      application_deadline: defaultValues?.application_deadline ?? '',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const sourceValue = form.watch('source')

  useEffect(() => {
    if (sourceValue !== 'other') {
      form.setValue('source_other', '')
    }
  }, [sourceValue, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Primary fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Company <span className="text-primary">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Job title <span className="text-primary">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Store Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status <span className="text-primary">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          <div className={cn('h-2.5 w-2.5 rounded-full', getStatusConfig(field.value).badgeClass)} />
                          <span>{getStatusConfig(field.value).label}</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select status" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn('h-2.5 w-2.5 rounded-full', getStatusConfig(option.value).badgeClass)} />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="seek">Seek</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="company_site">Company Site</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {sourceValue === 'other' && (
          <FormField
            control={form.control}
            name="source_other"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other source</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Gumtree, newspaper" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator />

        {/* More details toggle */}
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', showDetails && 'rotate-180')}
          />
          {showDetails ? 'Less details' : 'More details'}
        </button>

        {/* Secondary fields */}
        {showDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sydney, NSW" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary range</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. $80k - $100k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_applied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date applied</FormLabel>
                    <FormControl>
                      <DateInput {...field} value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="application_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application deadline</FormLabel>
                    <FormControl>
                      <DateInput {...field} value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="follow_up_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up date</FormLabel>
                    <FormControl>
                      <DateInput {...field} value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="job_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Paste the link to the job listing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. remote, part-time, urgent" {...field} />
                  </FormControl>
                  <FormDescription>Separate tags with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Separator />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          variant="default"
        >
          {isSubmitting
            ? mode === 'edit'
              ? 'Saving...'
              : 'Adding...'
            : mode === 'edit'
              ? 'Save Changes'
              : 'Add job'}
        </Button>
      </form>
    </Form>
  )
}
