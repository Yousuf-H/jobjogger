import { ContactForm } from '@/components/contact/ContactForm'
import { InteractionForm } from '@/components/contact/InteractionForm'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
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
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TypographyH1 } from '@/components/ui/typography'
import { useContactActions } from '@/hooks/useContactActions'
import { useContact } from '@/hooks/useContacts'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { ContactFormValues, InteractionFormValues } from '@/lib/validations/contact'
import { getStatusConfig } from '@/lib/statusConfig'
import {
  INTERACTION_TYPE_LABELS,
  type ContactInteraction,
} from '@/types/contact'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  Mail,
  MessageSquarePlus,
  MoreVertical,
  Pencil,
  Phone,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

// ─── Interaction item ─────────────────────────────────────────────────────────

function InteractionItem({
  interaction,
  contactId,
  onDelete,
  isDeleting,
}: {
  interaction: ContactInteraction
  contactId: number
  onDelete: (interactionId: number) => void
  isDeleting: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {INTERACTION_TYPE_LABELS[interaction.interaction_type]}
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(interaction.occurred_at).toLocaleDateString()}
          </span>
        </div>
        {interaction.notes && (
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {interaction.notes}
          </p>
        )}
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete interaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This interaction log will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(interaction.id)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Interactions tab ─────────────────────────────────────────────────────────

function InteractionsTab({
  contactId,
  interactions,
}: {
  contactId: number
  interactions: ContactInteraction[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const { createInteractionMutation, deleteInteractionMutation } =
    useContactActions()

  const handleAdd = (data: InteractionFormValues) => {
    createInteractionMutation.mutate(
      { contactId, data },
      { onSuccess: () => setAddOpen(false) }
    )
  }

  const handleDelete = (interactionId: number) => {
    deleteInteractionMutation.mutate({ contactId, interactionId })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {interactions.length === 0
            ? 'No interactions logged yet.'
            : `${interactions.length} interaction${interactions.length !== 1 ? 's' : ''}`}
        </p>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Interaction</DialogTitle>
            </DialogHeader>
            <InteractionForm
              key={addOpen ? 'open' : 'closed'}
              onSubmit={handleAdd}
              isSubmitting={createInteractionMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {interactions.length > 0 && (
        <div className="space-y-2">
          {[...interactions]
            .sort(
              (a, b) =>
                new Date(b.occurred_at).getTime() -
                new Date(a.occurred_at).getTime()
            )
            .map((interaction) => (
              <InteractionItem
                key={interaction.id}
                interaction={interaction}
                contactId={contactId}
                onDelete={handleDelete}
                isDeleting={deleteInteractionMutation.isPending}
              />
            ))}
        </div>
      )}
    </div>
  )
}

// ─── Jobs tab ─────────────────────────────────────────────────────────────────

function JobsTab({
  jobs,
}: {
  jobs: NonNullable<ReturnType<typeof useContact>['data']>['jobs']
}) {
  if (!jobs || jobs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm italic">
        No jobs linked to this contact yet.
      </p>
    )
  }

  return (
    <div className="-mx-6 -mb-6">
      {jobs.map((job, i) => {
        const statusConfig = getStatusConfig(job.status)
        return (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className={`hover:bg-muted/50 group flex items-center justify-between gap-4 px-6 py-3.5 transition-colors ${i !== 0 ? 'border-t' : ''}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className="border-background h-2.5 w-2.5 shrink-0 rounded-full border-2 shadow-sm"
                style={{ backgroundColor: statusConfig.color }}
              />
              <div className="min-w-0">
                <p className="group-hover:text-primary truncate text-sm font-medium transition-colors">
                  {job.job_title}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {job.company_name}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data: contact, isLoading, error } = useContact(id)
  const { updateMutation, deleteMutation } = useContactActions({
    onDeleteSuccess: () => navigate('/contacts'),
  })

  usePageTitle(contact?.name ?? 'Contact')

  if (isLoading) return <PageLoading variant="detail" />
  if (error) return <PageError message={error.message} />
  if (!contact)
    return (
      <PageError
        title="Contact not found"
        message="This contact may have been deleted."
      />
    )

  const interactions = contact.contact_interactions ?? []
  const jobs = contact.jobs ?? []

  const handleUpdate = (data: ContactFormValues) => {
    updateMutation.mutate(
      { id: contact.id, data },
      { onSuccess: () => setEditOpen(false) }
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.history.length > 1 ? navigate(-1) : navigate('/contacts')
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Contact</DialogTitle>
                </DialogHeader>
                <ContactForm
                  key={editOpen ? 'open' : 'closed'}
                  onSubmit={handleUpdate}
                  defaultValues={{
                    name: contact.name,
                    role: contact.role ?? '',
                    email: contact.email ?? '',
                    phone: contact.phone ?? '',
                    linkedin_url: contact.linkedin_url ?? '',
                    notes: contact.notes ?? '',
                    organisation_id: contact.organisation_id ?? null,
                  }}
                  isSubmitting={updateMutation.isPending}
                  mode="edit"
                />
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <strong>{contact.name}</strong> will be permanently
                        deleted along with all their interaction history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(contact.id)}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Header card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-sm">
          <div className="bg-primary h-1.5" />
          <CardContent className="p-6">
            <TypographyH1 className="text-2xl font-bold tracking-tight">
              {contact.name}
            </TypographyH1>
            {contact.role && (
              <p className="text-muted-foreground mt-1 text-base">
                {contact.role}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-6 border-t pt-5">
              {contact.organisation && (
                <div className="flex items-center gap-3">
                  <div className="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300 flex size-9 items-center justify-center rounded-lg">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Organisation</p>
                    <Link
                      to={`/organisations/${contact.organisation.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {contact.organisation.name}
                    </Link>
                  </div>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300 flex size-9 items-center justify-center rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300 flex size-9 items-center justify-center rounded-lg">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="text-sm font-medium">{contact.phone}</p>
                  </div>
                </div>
              )}
              {contact.linkedin_url && (
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex size-9 items-center justify-center rounded-lg">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">LinkedIn</p>
                    <a
                      href={
                        contact.linkedin_url.startsWith('http')
                          ? contact.linkedin_url
                          : `https://${contact.linkedin_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      View profile <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              {jobs.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300 flex size-9 items-center justify-center rounded-lg">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Linked jobs</p>
                    <p className="text-sm font-medium">{jobs.length}</p>
                  </div>
                </div>
              )}
            </div>

            {contact.notes && (
              <>
                <Separator className="my-4" />
                <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {contact.notes}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <Tabs defaultValue="interactions" className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="interactions"
                  className="data-[state=active]:border-primary gap-1.5 rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Interactions
                  {interactions.length > 0 && (
                    <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                      {interactions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="data-[state=active]:border-primary gap-1.5 rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Jobs
                  {jobs.length > 0 && (
                    <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                      {jobs.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6">
              <TabsContent value="interactions" className="mt-0">
                <InteractionsTab
                  contactId={contact.id}
                  interactions={interactions}
                />
              </TabsContent>
              <TabsContent value="jobs" className="mt-0">
                <JobsTab jobs={jobs} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
