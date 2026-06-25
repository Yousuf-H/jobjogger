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
import {
  IconBrandLinkedin,
  IconCoffee,
  IconMail,
  IconMessage,
  IconMicrophone,
  IconPencil,
  IconPhone,
  IconTrash,
} from '@tabler/icons-react'
import { format, parseISO } from 'date-fns'
import { useContactActions } from '@/hooks/useContactActions'
import { useContact } from '@/hooks/useContacts'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { ContactFormValues, InteractionFormValues } from '@/lib/validations/contact'
import { getStatusConfig } from '@/lib/statusConfig'
import { cn } from '@/lib/utils'
import {
  INTERACTION_TYPE_LABELS,
  type ContactInteraction,
  type InteractionType,
} from '@/types/contact'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

// ─── Interaction icon config ──────────────────────────────────────────────────

function getInteractionIconConfig(type: InteractionType) {
  switch (type) {
    case 'call':
      return { Icon: IconPhone, bg: 'bg-[#F0FDF4] dark:bg-green-950/30', ring: 'ring-[#BBF7D0] dark:ring-green-800', color: 'text-[#16A34A] dark:text-green-400' }
    case 'email':
      return { Icon: IconMail, bg: 'bg-[#EFF6FF] dark:bg-blue-950/30', ring: 'ring-[#BFDBFE] dark:ring-blue-800', color: 'text-[#2563EB] dark:text-blue-400' }
    case 'linkedin':
      return { Icon: IconBrandLinkedin, bg: 'bg-[#EFF6FF] dark:bg-blue-950/30', ring: 'ring-[#BFDBFE] dark:ring-blue-800', color: 'text-[#0A66C2] dark:text-blue-400' }
    case 'coffee_chat':
      return { Icon: IconCoffee, bg: 'bg-[#FFFBEB] dark:bg-amber-950/30', ring: 'ring-[#FDE68A] dark:ring-amber-800', color: 'text-[#D97706] dark:text-amber-400' }
    case 'interview':
      return { Icon: IconMicrophone, bg: 'bg-[#F5F3FF] dark:bg-violet-950/30', ring: 'ring-[#DDD6FE] dark:ring-violet-800', color: 'text-[#7C3AED] dark:text-violet-400' }
    default:
      return { Icon: IconMessage, bg: 'bg-[#F9FAFB] dark:bg-muted', ring: 'ring-[#E5E7EB] dark:ring-border', color: 'text-[#6B7280] dark:text-muted-foreground' }
  }
}

// ─── Meta item (matches job/org detail pattern) ──────────────────────────────

function MetaItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-[8px] pr-[20px] mr-[20px] border-r border-[#E5E7EB] last:border-r-0 last:pr-0 last:mr-0 dark:border-border">
      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-[#F9FAFB] border border-[#F3F4F6] dark:bg-muted dark:border-border/60">
        <Icon className="h-[13px] w-[13px] text-[#9CA3AF] dark:text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-[#9CA3AF] leading-tight dark:text-muted-foreground">
          {label}
        </span>
        {children}
      </div>
    </div>
  )
}

// ─── Interaction item ─────────────────────────────────────────────────────────

function EditInteractionDialog({
  contactId,
  interaction,
  trigger,
}: {
  contactId: number
  interaction: ContactInteraction
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { updateInteractionMutation } = useContactActions()

  const handleUpdate = (data: InteractionFormValues) => {
    updateInteractionMutation.mutate(
      { contactId, interactionId: interaction.id, data },
      { onSuccess: () => setOpen(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Interaction</DialogTitle>
        </DialogHeader>
        <InteractionForm
          key={open ? 'open' : 'closed'}
          mode="edit"
          onSubmit={handleUpdate}
          isSubmitting={updateInteractionMutation.isPending}
          defaultValues={{
            interaction_type: interaction.interaction_type,
            notes: interaction.notes ?? '',
            occurred_at: interaction.occurred_at.split('T')[0],
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function DeleteInteractionAlertDialog({
  contactId,
  interaction,
  trigger,
}: {
  contactId: number
  interaction: ContactInteraction
  trigger: React.ReactNode
}) {
  const { deleteInteractionMutation } = useContactActions()

  const handleDelete = () => {
    deleteInteractionMutation.mutate({ contactId, interactionId: interaction.id })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
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
            onClick={handleDelete}
            disabled={deleteInteractionMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function InteractionItem({
  contactId,
  interaction,
}: {
  contactId: number
  interaction: ContactInteraction
}) {
  const { Icon, bg, ring, color } = getInteractionIconConfig(interaction.interaction_type)
  const dateStr = format(parseISO(interaction.occurred_at.split('T')[0]), 'd MMM yyyy')

  return (
    <div className="timeline-row relative flex gap-[14px] rounded-[8px] px-[6px] py-[10px]">
      {/* Dot */}
      <div
        className={cn(
          'relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 border-card ring-1',
          bg,
          ring
        )}
        style={{ marginLeft: '-8px' }}
      >
        <Icon className={cn('h-[15px] w-[15px]', color)} />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 pt-[2px]">
        <p className={cn('text-[12px] font-medium', color)}>
          {INTERACTION_TYPE_LABELS[interaction.interaction_type]}
        </p>
        {interaction.notes && (
          <p className="mt-[2px] whitespace-pre-wrap text-[13px] leading-[1.5] text-[#374151] dark:text-foreground/80">
            {interaction.notes}
          </p>
        )}

        {/* Mobile action chips */}
        <div className="timeline-mobile-actions mt-[8px] gap-[6px]">
          <EditInteractionDialog
            contactId={contactId}
            interaction={interaction}
            trigger={
              <button className="flex items-center gap-[4px] rounded-[6px] border-[0.5px] border-[#E5E7EB] px-[8px] py-[3px] text-[11px] text-[#6B7280] dark:border-border dark:text-muted-foreground">
                <IconPencil className="h-[11px] w-[11px]" />
                Edit
              </button>
            }
          />
          <DeleteInteractionAlertDialog
            contactId={contactId}
            interaction={interaction}
            trigger={
              <button className="flex items-center gap-[4px] rounded-[6px] border-[0.5px] border-[#FECACA] bg-[#FEF2F2] px-[8px] py-[3px] text-[11px] text-[#DC2626] dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                <IconTrash className="h-[11px] w-[11px]" />
                Delete
              </button>
            }
          />
        </div>
      </div>

      {/* Date / actions column — fixed width so hover never shifts layout */}
      <div className="relative h-[22px] w-[116px] shrink-0">
        <span className="timeline-date absolute right-0 text-[11px] text-[#9CA3AF] dark:text-muted-foreground">
          {dateStr}
        </span>

        <div className="timeline-actions absolute right-0 flex items-center gap-[6px]">
          <EditInteractionDialog
            contactId={contactId}
            interaction={interaction}
            trigger={
              <button className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] border-[0.5px] border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3F4F6] dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted">
                <IconPencil className="h-[12px] w-[12px]" />
              </button>
            }
          />
          <DeleteInteractionAlertDialog
            contactId={contactId}
            interaction={interaction}
            trigger={
              <button className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] border-[0.5px] border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626] dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400">
                <IconTrash className="h-[12px] w-[12px]" />
              </button>
            }
          />
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Interactions ────────────────────────────────────────────────────────

function InteractionsTab({
  contactId,
  interactions,
}: {
  contactId: number
  interactions: ContactInteraction[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const { createInteractionMutation } = useContactActions()

  const handleAdd = (data: InteractionFormValues) => {
    createInteractionMutation.mutate(
      { contactId, data },
      { onSuccess: () => setAddOpen(false) }
    )
  }

  return (
    <div className="space-y-[12px]">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[#9CA3AF] dark:text-muted-foreground">
          {interactions.length === 0
            ? 'No interactions logged yet.'
            : `${interactions.length} interaction${interactions.length !== 1 ? 's' : ''}`}
        </p>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-[6px] rounded-[7px] bg-[#2563EB] px-[12px] py-[6px] text-[12px] font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-[13px] w-[13px]" />
              Log interaction
            </button>
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
        <div className="relative">
          <div
            className="absolute w-[1.5px] bg-[#E5E7EB] dark:bg-border"
            style={{ left: '15px', top: '25px', bottom: '25px' }}
          />
          <div>
            {[...interactions]
              .sort(
                (a, b) =>
                  new Date(b.occurred_at).getTime() -
                  new Date(a.occurred_at).getTime()
              )
              .map((interaction) => (
                <InteractionItem
                  key={interaction.id}
                  contactId={contactId}
                  interaction={interaction}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Jobs ────────────────────────────────────────────────────────────────

function JobsTab({
  jobs,
}: {
  jobs: NonNullable<ReturnType<typeof useContact>['data']>['jobs']
}) {
  if (!jobs || jobs.length === 0) {
    return (
      <p className="text-[13px] text-[#9CA3AF] italic dark:text-muted-foreground">
        No jobs linked to this contact yet.
      </p>
    )
  }

  return (
    <div className="-mx-[20px] -mb-[16px]">
      {jobs.map((job, i) => {
        const statusConfig = getStatusConfig(job.status)
        return (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className={`hover:bg-muted/50 group flex items-center justify-between gap-4 px-[20px] py-3.5 transition-colors ${i !== 0 ? 'border-t' : ''}`}
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

type ActiveTab = 'interactions' | 'jobs'

export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('interactions')

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

  const tabs: { key: ActiveTab; label: string; count?: number }[] = [
    { key: 'interactions', label: 'Interactions', count: interactions.length },
    { key: 'jobs', label: 'Jobs', count: jobs.length },
  ]

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate('/contacts')
          }
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-[14px] w-[14px]" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-[6px] rounded-[7px] border border-border bg-card px-[12px] py-[6px] text-[12px] font-medium text-foreground/80 hover:bg-muted/50 transition-colors">
                <Pencil className="h-[13px] w-[13px]" />
                Edit
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit contact</DialogTitle>
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
              <Button variant="ghost" className="h-[26px] w-[26px] p-0">
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
      <div className="rounded-[10px] border border-[#E5E7EB] bg-card p-[18px_20px] dark:border-border">
        <h1 className="text-[20px] font-semibold tracking-tight text-[#111827] leading-tight mb-[4px] dark:text-foreground">
          {contact.name}
        </h1>
        {contact.role && (
          <p className="text-[13px] text-[#6B7280] dark:text-muted-foreground">
            {contact.role}
          </p>
        )}

        {/* Meta strip */}
        <div className="flex flex-wrap items-stretch pt-[14px] mt-[14px] border-t border-[#F3F4F6] dark:border-border/60 gap-y-[10px]">
          {contact.organisation && (
            <MetaItem icon={Building2} label="Organisation">
              <Link
                to={`/organisations/${contact.organisation.id}`}
                className="text-[12px] font-medium text-[#2563EB] hover:underline leading-tight dark:text-blue-400"
              >
                {contact.organisation.name}
              </Link>
            </MetaItem>
          )}
          {contact.email && (
            <MetaItem icon={Mail} label="Email">
              <a
                href={`mailto:${contact.email}`}
                className="text-[12px] font-medium text-[#374151] hover:underline leading-tight dark:text-foreground/80"
              >
                {contact.email}
              </a>
            </MetaItem>
          )}
          {contact.phone && (
            <MetaItem icon={Phone} label="Phone">
              <span className="text-[12px] font-medium text-[#374151] leading-tight dark:text-foreground/80">
                {contact.phone}
              </span>
            </MetaItem>
          )}
          {contact.linkedin_url && (
            <MetaItem icon={ExternalLink} label="LinkedIn">
              <a
                href={
                  contact.linkedin_url.startsWith('http')
                    ? contact.linkedin_url
                    : `https://${contact.linkedin_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[3px] text-[12px] font-medium text-[#2563EB] hover:underline leading-tight dark:text-blue-400"
              >
                View profile <ExternalLink className="h-[10px] w-[10px]" />
              </a>
            </MetaItem>
          )}
          <MetaItem icon={Briefcase} label="Linked jobs">
            <span className="text-[12px] font-medium text-[#374151] leading-tight dark:text-foreground/80">
              {jobs.length}
            </span>
          </MetaItem>
        </div>

        {/* Notes */}
        {contact.notes && (
          <>
            <div className="border-t border-[#F3F4F6] mt-[16px] mb-[14px] dark:border-border/60" />
            <p className="text-[13px] text-[#374151] leading-[1.6] whitespace-pre-wrap dark:text-foreground/80">
              {contact.notes}
            </p>
          </>
        )}
      </div>

      {/* Tabs card */}
      <div className="rounded-[10px] border border-[#E5E7EB] bg-card overflow-hidden dark:border-border">
        {/* Tab bar */}
        <div className="overflow-x-auto border-b border-[#E5E7EB] px-[16px] flex scrollbar-hide dark:border-border">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex shrink-0 items-center gap-[5px] whitespace-nowrap border-b-2 -mb-px px-[12px] py-[11px] text-[12px] cursor-pointer transition-colors',
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB] font-medium dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-[#6B7280] hover:text-foreground dark:text-muted-foreground'
                )}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-[5px] py-[1px] text-[10px] leading-tight',
                      isActive
                        ? 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/50 dark:text-blue-300'
                        : 'bg-[#F3F4F6] text-[#6B7280] dark:bg-muted dark:text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-[16px_20px]">
          {activeTab === 'interactions' && (
            <InteractionsTab
              contactId={contact.id}
              interactions={interactions}
            />
          )}
          {activeTab === 'jobs' && <JobsTab jobs={jobs} />}
        </div>
      </div>
    </div>
  )
}
