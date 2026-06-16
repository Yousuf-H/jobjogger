import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  type InteractionFormValues,
  interactionSchema,
} from '@/lib/validations/contact'
import { INTERACTION_TYPE_LABELS, INTERACTION_TYPES } from '@/types/contact'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormValues) => void
  isSubmitting?: boolean
  defaultValues?: Partial<InteractionFormValues>
  mode?: 'create' | 'edit'
}

export function InteractionForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  mode = 'create',
}: InteractionFormProps) {
  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_type: undefined,
      notes: '',
      occurred_at: format(new Date(), 'yyyy-MM-dd'),
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTERACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {INTERACTION_TYPE_LABELS[type]}
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
            name="occurred_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input type="date" className="pl-9 cursor-pointer" max="9999-12-31" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What did you discuss?"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[7px] bg-[#2563EB] py-[8px] text-[13px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {isSubmitting
            ? mode === 'edit'
              ? 'Saving...'
              : 'Logging...'
            : mode === 'edit'
              ? 'Save Changes'
              : 'Log Interaction'}
        </button>
      </form>
    </Form>
  )
}
