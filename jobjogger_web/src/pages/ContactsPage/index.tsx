import { DataTable } from '@/components/ui/DataTable'
import { ContactForm } from '@/components/contact/ContactForm'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useContactActions } from '@/hooks/useContactActions'
import { useContacts } from '@/hooks/useContacts'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'
import type { ContactFormValues } from '@/lib/validations/contact'
import type { Contact } from '@/types/contact'
import type { ColumnDef } from '@tanstack/react-table'
import { Building2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AVATAR_COLORS = [
  'bg-avatar-1/15 text-avatar-1',
  'bg-avatar-2/15 text-avatar-2',
  'bg-avatar-3/15 text-avatar-3',
  'bg-avatar-4/15 text-avatar-4',
  'bg-avatar-5/15 text-avatar-5',
  'bg-avatar-6/15 text-avatar-6',
]

function avatarColorClasses(contact: Contact) {
  return AVATAR_COLORS[contact.id % AVATAR_COLORS.length]
}

function ContactMobileRow({
  contact,
  onClick,
}: {
  contact: Contact
  onClick: () => void
}) {
  const initial = contact.name.charAt(0).toUpperCase()

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/40 last:border-0 focus-visible:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-blue-900/20"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold mt-0.5',
          avatarColorClasses(contact)
        )}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-medium text-sm truncate block">{contact.name}</span>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {contact.role && <span>{contact.role}</span>}
          {contact.organisation && <span>{contact.organisation.name}</span>}
          {contact.email && <span className="truncate">{contact.email}</span>}
          {contact.jobs && contact.jobs.length > 0 && (
            <span>
              {contact.jobs.length} {contact.jobs.length === 1 ? 'job' : 'jobs'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  usePageTitle('Contacts')
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: contacts, isLoading, isFetching, error } = useContacts({
    search: search || undefined,
  })
  const { createMutation } = useContactActions({
    onCreateSuccess: () => setCreateOpen(false),
  })

  const handleCreate = (data: ContactFormValues) => {
    createMutation.mutate(data)
  }

  const tableColumns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
        cell: ({ row }) => {
          const role = row.getValue<string | null>('role')
          if (!role) return <span className="text-muted-foreground/40 text-sm">—</span>
          return <span className="text-sm text-muted-foreground">{role}</span>
        },
      },
      {
        id: 'organisation',
        header: 'Organisation',
        enableSorting: true,
        accessorFn: (row) => row.organisation?.name ?? '',
        cell: ({ row }) => {
          const org = row.original.organisation
          if (!org) return <span className="text-muted-foreground/40 text-sm">—</span>
          return (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {org.name}
            </span>
          )
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
        cell: ({ row }) => {
          const email = row.getValue<string | null>('email')
          if (!email) return <span className="text-muted-foreground/40 text-sm">—</span>
          return <span className="text-sm text-muted-foreground">{email}</span>
        },
      },
      {
        id: 'linked_jobs',
        header: 'Linked jobs',
        enableSorting: true,
        accessorFn: (row) => row.jobs?.length ?? 0,
        cell: ({ row }) => {
          const count = row.original.jobs?.length ?? 0
          return <span className="text-sm tabular-nums">{count}</span>
        },
      },
    ],
    []
  )

  const handleContactClick = (contact: Contact) =>
    navigate(`/contacts/${contact.id}`)

  return (
    <div className="space-y-[14px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
            Contacts
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            People you've met throughout your job search.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="default">
              <Plus className="h-4 w-4" />
              New contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add contact</DialogTitle>
              <DialogDescription className="sr-only">
                Fill in the details to add a new contact.
              </DialogDescription>
            </DialogHeader>
            <ContactForm
              key={createOpen ? 'open' : 'closed'}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by name, role or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-8 w-full shrink-0 text-sm sm:w-[200px] lg:w-[260px] transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}
            />
            <span className="text-muted-foreground text-xs font-medium sm:ml-auto">
              {contacts?.length ?? 0}{' '}
              {contacts?.length === 1 ? 'contact' : 'contacts'}
            </span>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <PageLoading variant="default" />
      ) : error ? (
        <PageError message={error.message} />
      ) : (
        <Card className="overflow-hidden border-0 p-0 shadow-sm">
          <div className="hidden sm:block">
            <DataTable
              columns={tableColumns}
              data={contacts ?? []}
              onRowClick={handleContactClick}
              defaultSort={[{ id: 'name', desc: false }]}
              emptyMessage={search ? 'No contacts match your search.' : 'No contacts yet. Add your first one.'}
            />
          </div>
          <div className="sm:hidden">
            {(contacts ?? []).length > 0 ? (
              contacts!.map((contact) => (
                <ContactMobileRow
                  key={contact.id}
                  contact={contact}
                  onClick={() => handleContactClick(contact)}
                />
              ))
            ) : (
              <p className="p-4 text-center text-sm text-muted-foreground">
                {search ? 'No contacts match your search.' : 'No contacts yet. Add your first one.'}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
