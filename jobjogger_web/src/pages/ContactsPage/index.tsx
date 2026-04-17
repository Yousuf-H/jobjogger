import { ContactCard } from '@/components/contact/ContactCard'
import { ContactForm } from '@/components/contact/ContactForm'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { TypographyH1 } from '@/components/ui/typography'
import { useContactActions } from '@/hooks/useContactActions'
import { useContacts } from '@/hooks/useContacts'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { ContactFormValues } from '@/lib/validations/contact'
import { Plus, Users } from 'lucide-react'
import { useState } from 'react'

export default function ContactsPage() {
  usePageTitle('Contacts')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: contacts, isLoading, error } = useContacts({ search: search || undefined })
  const { createMutation } = useContactActions({
    onCreateSuccess: () => setCreateOpen(false),
  })

  const handleCreate = (data: ContactFormValues) => {
    createMutation.mutate(data)
  }

  if (isLoading) return <PageLoading />
  if (error) return <PageError message={error.message} />

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <TypographyH1>Contacts</TypographyH1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="success" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Contact</DialogTitle>
            </DialogHeader>
            <ContactForm
              key={createOpen ? 'open' : 'closed'}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by name, role or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* List */}
      {contacts && contacts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="text-muted-foreground/40 mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            {search ? 'No contacts match your search.' : 'No contacts yet. Add your first one.'}
          </p>
        </div>
      )}
    </div>
  )
}
