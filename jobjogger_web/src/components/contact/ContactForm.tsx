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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  type ContactFormValues,
  contactSchema,
} from '@/lib/validations/contact'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface ContactFormProps {
  onSubmit: (data: ContactFormValues) => void
  defaultValues?: Partial<ContactFormValues>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  organisationId?: number | null
  organisationName?: string | null
}

export function ContactForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode = 'create',
  organisationId,
  organisationName,
}: ContactFormProps) {
  const [showDetails, setShowDetails] = useState(mode === 'edit')

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
      linkedin_url: '',
      notes: '',
      organisation_id: organisationId ?? null,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {organisationName && (
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Building2 className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-muted-foreground">Organisation:</span>
            <span className="font-medium">{organisationName}</span>
          </div>
        )}

        {/* Primary fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className="text-primary">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Grace Hopper" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="Hiring Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="grace@company.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+61 400 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      {...field}
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
                      placeholder="Any notes about this contact..."
                      className="resize-none"
                      rows={3}
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
          variant="default"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Adding...'
              : 'Saving...'
            : mode === 'create'
              ? 'Add contact'
              : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
