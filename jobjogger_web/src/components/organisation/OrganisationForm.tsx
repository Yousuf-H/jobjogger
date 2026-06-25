import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ORG_SIZES, type OrgSize } from '@/types/organisation'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const organisationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z
    .enum(['1-10', '11-50', '51-200', '201-1000', '1000+'])
    .optional(),
  rating: z
    .number()
    .min(0.1, 'Rating must be at least 0.1')
    .max(5, 'Rating cannot exceed 5')
    .optional()
    .nullable(),
  notes: z.string().optional(),
})

export type OrganisationFormValues = z.infer<typeof organisationSchema>

interface OrganisationFormProps {
  onSubmit: (data: OrganisationFormValues) => void
  defaultValues?: Partial<OrganisationFormValues>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function OrganisationForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode = 'create',
}: OrganisationFormProps) {
  const [showDetails, setShowDetails] = useState(mode === 'edit')

  const form = useForm<OrganisationFormValues>({
    resolver: zodResolver(organisationSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      website: defaultValues?.website ?? '',
      industry: defaultValues?.industry ?? '',
      size: defaultValues?.size ?? undefined,
      rating: defaultValues?.rating ?? null,
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Primary fields */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-primary">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Acme Corporation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Technology" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company size</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v as OrgSize)}
                  value={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ORG_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://acme.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Rating{' '}
                    <span className="text-muted-foreground font-normal">(0.1 – 5)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 4.2"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === '' ? null : parseFloat(val))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about this organisation..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
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
              : 'Add organisation'}
        </Button>
      </form>
    </Form>
  )
}
