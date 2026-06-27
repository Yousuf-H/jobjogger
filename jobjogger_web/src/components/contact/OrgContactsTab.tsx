import { ContactAvatar } from '@/components/contact/ContactAvatar'
import { ContactForm } from '@/components/contact/ContactForm'
import EmptyTabState from '@/components/job/EmptyTabState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useContactActions } from '@/hooks/useContactActions'
import { useContacts } from '@/hooks/useContacts'
import type { ContactFormValues } from '@/lib/validations/contact'
import type { Contact } from '@/types/contact'
import { Briefcase, Mail, Plus, Phone, Users } from 'lucide-react'
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
      {contacts.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </p>
          <Button size="sm" variant="default" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add contact
          </Button>
        </div>
      )}

      {!isLoading && contacts.length === 0 ? (
        <EmptyTabState
          icon={Users}
          title="No contacts at this organisation yet"
          description="Add people you've spoken to or connected with at this company."
          actionLabel="Add contact"
          onAction={() => setCreateOpen(true)}
        />
      ) : contacts.length > 0 ? (
        <div className="-mx-6 -mb-6">
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription className="sr-only">
              Fill in the details to add a new contact to this organisation.
            </DialogDescription>
          </DialogHeader>
          {/* TODO: replace key trick with form.reset() in onOpenChange — requires lifting useForm to dialog scope */}
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
  )
}
