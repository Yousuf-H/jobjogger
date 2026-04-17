import { ContactAvatar } from '@/components/contact/ContactAvatar'
import { ContactForm } from '@/components/contact/ContactForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useContactActions } from '@/hooks/useContactActions'
import { useContacts } from '@/hooks/useContacts'
import type { ContactFormValues } from '@/lib/validations/contact'
import type { Contact } from '@/types/contact'
import { Briefcase, Mail, Plus, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <Link
      to={`/contacts/${contact.id}`}
      className="hover:bg-muted/50 group flex items-center gap-4 border-t px-6 py-3.5 transition-colors first:border-t-0"
    >
      <ContactAvatar name={contact.name} />
      <div className="min-w-0 flex-1">
        <p className="group-hover:text-primary truncate text-sm font-medium transition-colors">
          {contact.name}
        </p>
        <div className="flex items-center gap-3">
          {contact.role && (
            <p className="text-muted-foreground truncate text-xs">{contact.role}</p>
          )}
          {contact.email && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Mail className="h-2.5 w-2.5" />
              {contact.email}
            </p>
          )}
          {contact.phone && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Phone className="h-2.5 w-2.5" />
              {contact.phone}
            </p>
          )}
        </div>
      </div>
      {contact.jobs && contact.jobs.length > 0 && (
        <p className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
          <Briefcase className="h-3 w-3" />
          {contact.jobs.length}
        </p>
      )}
    </Link>
  )
}

interface OrgContactsTabProps {
  organisationId: number
  organisationName: string
}

export function OrgContactsTab({ organisationId, organisationName }: OrgContactsTabProps) {
  const [createOpen, setCreateOpen] = useState(false)

  const { data: contacts = [], isLoading } = useContacts({ organisation_id: organisationId })
  const { createMutation } = useContactActions({
    onCreateSuccess: () => setCreateOpen(false),
  })

  const handleCreate = (data: ContactFormValues) => {
    createMutation.mutate({ ...data, organisation_id: organisationId })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? 'Loading...'
            : contacts.length === 0
              ? 'No contacts at this organisation yet.'
              : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="success">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
            </DialogHeader>
            <ContactForm
              key={createOpen ? 'open' : 'closed'}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
              organisationId={organisationId}
              organisationName={organisationName}
            />
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length > 0 && (
        <div className="-mx-6 -mb-6">
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  )
}
