import { ContactAvatar } from '@/components/contact/ContactAvatar'
import { ContactForm } from '@/components/contact/ContactForm'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useContactActions } from '@/hooks/useContactActions'
import { useContacts, useJobContacts } from '@/hooks/useContacts'
import { cn } from '@/lib/utils'
import type { ContactFormValues } from '@/lib/validations/contact'
import type { Contact } from '@/types/contact'
import { Building2, Check, ChevronsUpDown, Mail, Unlink, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface JobContactsTabProps {
  jobId: number
  organisationId?: number | null
}

function ContactRow({
  contact,
  onUnlink,
  isUnlinking,
}: {
  contact: Contact
  jobId: number
  onUnlink: (contactId: number) => void
  isUnlinking: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ContactAvatar name={contact.name} />
        <div className="min-w-0">
          <Link
            to={`/contacts/${contact.id}`}
            className="hover:text-primary truncate text-sm font-medium transition-colors"
          >
            {contact.name}
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {contact.role && (
              <p className="text-muted-foreground truncate text-xs">
                {contact.role}
              </p>
            )}
            {contact.organisation && (
              <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                <Building2 className="h-2.5 w-2.5" />
                {contact.organisation.name}
              </p>
            )}
            {contact.email && (
              <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                <Mail className="h-2.5 w-2.5" />
                {contact.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Unlink className="mr-1.5 h-3.5 w-3.5" />
            Unlink
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink contact?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{contact.name}</strong> will be removed from this job.
              The contact itself won't be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onUnlink(contact.id)}
              disabled={isUnlinking}
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Searchable contact combobox ──────────────────────────────────────────────

function ContactCombobox({
  contacts,
  value,
  onChange,
}: {
  contacts: Contact[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  const selected = contacts.find((c) => String(c.id) === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="truncate">
              {selected.name}
              {selected.role ? ` — ${selected.role}` : ''}
              {selected.organisation ? ` · ${selected.organisation.name}` : ''}
            </span>
          ) : (
            <span className="text-muted-foreground">Search contacts...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Type a name, role or organisation..." />
          <CommandList>
            <CommandEmpty>No contacts found.</CommandEmpty>
            <CommandGroup>
              {contacts.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.role ?? ''} ${c.organisation?.name ?? ''}`}
                  onSelect={() => {
                    onChange(String(c.id))
                    setOpen(false)
                  }}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {[c.role, c.organisation?.name].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === String(c.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Tab ──────────────────────────────────────────────────────────────────────

export function JobContactsTab({ jobId, organisationId }: JobContactsTabProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string>('')
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null)

  const { data: jobContacts = [] } = useJobContacts(jobId)
  const { data: allContacts = [] } = useContacts()
  const { createMutation, linkMutation, unlinkMutation } = useContactActions()

  const linkedIds = new Set(jobContacts.map((c) => c.id))
  const linkableContacts = allContacts.filter((c) => !linkedIds.has(c.id))

  const handleLink = () => {
    if (!selectedContactId) return
    linkMutation.mutate(
      { jobId, contactId: Number(selectedContactId) },
      {
        onSuccess: () => {
          setAddOpen(false)
          setSelectedContactId('')
        },
      }
    )
  }

  const handleCreate = (data: ContactFormValues) => {
    createMutation.mutate(
      { ...data, organisation_id: organisationId ?? undefined },
      {
        onSuccess: (newContact) => {
          setCreateOpen(false)
          linkMutation.mutate({ jobId, contactId: newContact.id })
        },
      }
    )
  }

  const handleUnlink = (contactId: number) => {
    setUnlinkingId(contactId)
    unlinkMutation.mutate({ jobId, contactId }, {
      onSettled: () => setUnlinkingId(null),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {jobContacts.length === 0
            ? 'No contacts linked to this job.'
            : `${jobContacts.length} contact${jobContacts.length !== 1 ? 's' : ''}`}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {linkableContacts.length > 0 && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Link Existing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link a Contact</DialogTitle>
                  <DialogDescription className="sr-only">
                    Search and link an existing contact to this job.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <ContactCombobox
                    contacts={linkableContacts}
                    value={selectedContactId}
                    onChange={setSelectedContactId}
                  />
                  <Button
                    onClick={handleLink}
                    disabled={!selectedContactId || linkMutation.isPending}
                    variant="default"
                    className="w-full"
                  >
                    {linkMutation.isPending ? 'Linking...' : 'Link contact'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Users className="mr-1.5 h-3.5 w-3.5" />
                New contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add contact</DialogTitle>
              <DialogDescription className="sr-only">
                Create a new contact and link them to this job.
              </DialogDescription>
              </DialogHeader>
              <ContactForm
                key={createOpen ? 'open' : 'closed'}
                onSubmit={handleCreate}
                isSubmitting={createMutation.isPending || linkMutation.isPending}
                organisationId={organisationId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {jobContacts.length > 0 && (
        <div className="divide-y">
          {jobContacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              jobId={jobId}
              onUnlink={handleUnlink}
              isUnlinking={unlinkingId === contact.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
