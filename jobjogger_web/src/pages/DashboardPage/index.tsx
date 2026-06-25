import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { StatusChart } from '@/components/dashboard/StatusChart'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useAuth } from '@/hooks/useAuth'
import { useJobActions } from '@/hooks/useJobActions'
import { useJobs } from '@/hooks/useJobs'
import { usePageTitle } from '@/hooks/usePageTitle'
import { calculateStatusBreakdown } from '@/lib/statsHelpers'
import { StatusBadge } from '@/components/job/StatusBadge'
import { cn } from '@/lib/utils'
import type { SummaryStats } from '@/types/analytics'
import type { Job } from '@/types/job'
import { format, formatDistanceToNow, isFuture, parseISO } from 'date-fns'
import { Clock, MailOpen, Mic, Plus, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Stat cards ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  subLabel: string
  icon: React.ElementType
  iconContainerClass: string
  iconColor: string
}

function StatCard({ label, value, subLabel, icon: Icon, iconContainerClass, iconColor }: StatCardProps) {
  return (
    <div className="rounded-[10px] border border-border bg-card" style={{ padding: '14px 16px' }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <div className={cn('flex h-[36px] w-[36px] items-center justify-center rounded-full', iconContainerClass)}>
          <Icon className={cn('h-[18px] w-[18px]', iconColor)} />
        </div>
      </div>
      <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{subLabel}</p>
    </div>
  )
}

function DashboardStatCards({ data }: { data: SummaryStats }) {
  const cards: StatCardProps[] = [
    {
      label: 'Total applied',
      value: String(data.total_applied),
      subLabel: 'Applications sent',
      icon: Send,
      iconContainerClass: 'bg-blue-50 border border-blue-200 dark:bg-blue-500/20 dark:border-blue-500/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Response rate',
      value: `${data.response_rate}%`,
      subLabel: 'Got a reply back',
      icon: MailOpen,
      iconContainerClass: 'bg-green-50 border border-green-200 dark:bg-green-500/20 dark:border-green-500/40',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Interview rate',
      value: `${data.interview_rate}%`,
      subLabel: 'Made it to interview',
      icon: Mic,
      iconContainerClass: 'bg-amber-50 border border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Avg. days to reply',
      value: data.avg_days_to_respond !== null ? String(data.avg_days_to_respond) : '—',
      subLabel: 'Time to first reply',
      icon: Clock,
      iconContainerClass: 'bg-purple-50 border border-purple-200 dark:bg-purple-500/20 dark:border-purple-500/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}

// ─── Recent jobs table ────────────────────────────────────────────────────────

function makeDashboardColumns(hasDateApplied: boolean, hasFollowUp: boolean, hasNextInterview: boolean): ColumnDef<Job>[] {
  const cols: ColumnDef<Job>[] = [
    {
      accessorKey: 'company_name',
      header: 'Company',
      cell: ({ row }) => (
        <span className="text-[12px] font-semibold text-foreground">
          {row.getValue('company_name')}
        </span>
      ),
    },
    {
      accessorKey: 'job_title',
      header: 'Role',
      cell: ({ row }) => (
        <span className="text-[12px] text-foreground/80">{row.getValue('job_title')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <StatusBadge job={row.original} />
        </div>
      ),
    },
  ]

  if (hasDateApplied) {
    cols.push({
      accessorKey: 'date_applied',
      header: 'Applied',
      cell: ({ row }) => {
        const date = row.getValue('date_applied') as string
        if (!date) return <span className="text-[12px] text-muted-foreground/40">—</span>
        return (
          <span className="text-[12px] text-foreground/80">
            {format(parseISO(date.split('T')[0]), 'd MMM yyyy')}
          </span>
        )
      },
    })
  }

  if (hasFollowUp) {
    cols.push({
      accessorKey: 'follow_up_date',
      header: 'Follow-up',
      cell: ({ row }) => {
        const date = row.getValue('follow_up_date') as string
        if (!date) return <span className="text-[12px] text-muted-foreground/40">—</span>
        const [year, month, day] = date.split('T')[0].split('-')
        const followUpDay = new Date(Number(year), Number(month) - 1, Number(day))
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const isOverdue = followUpDay < today
        return (
          <span className={`text-[12px] ${isOverdue ? 'text-destructive font-medium' : 'text-foreground/80'}`}>
            {format(parseISO(date.split('T')[0]), 'd MMM yyyy')}
          </span>
        )
      },
    })
  }

  if (hasNextInterview) {
    cols.push({
      accessorKey: 'next_interview_at',
      header: 'Next Interview',
      cell: ({ row }) => {
        const job = row.original
        if (!job.next_interview_at) return <span className="text-[12px] text-muted-foreground/40">—</span>
        const date = new Date(job.next_interview_at)
        if (!isFuture(date)) return <span className="text-[12px] text-muted-foreground/40">—</span>
        return (
          <span className="text-[12px] text-violet-600 dark:text-violet-400 font-medium">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        )
      },
    })
  }

  return cols
}

function RecentJobsTable({
  jobs,
  onRowClick,
  hasDateApplied,
  hasFollowUp,
  hasNextInterview,
}: {
  jobs: Job[]
  onRowClick: (id: number) => void
  hasDateApplied: boolean
  hasFollowUp: boolean
  hasNextInterview: boolean
}) {
  const columns = makeDashboardColumns(hasDateApplied, hasFollowUp, hasNextInterview)
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    // first/last column padding matches the px-5 card header above the table
    <div className="[&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_th:first-child]:pl-5 [&_th:last-child]:pr-5">
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="border-b border-border hover:bg-transparent">
            {hg.headers.map((header) => (
              <TableHead
                key={header.id}
                className="text-[11px] font-medium text-muted-foreground h-9"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer border-b border-border/60 hover:bg-muted/50 last:border-0"
              onClick={() => onRowClick((row.original as Job).id)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-[13px] text-muted-foreground">
              No jobs yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isLoading, error } = useJobs()
  const { handleView } = useJobActions()
  const { data: analyticsData } = useAnalytics()

  if (isLoading) return <PageLoading variant="dashboard" />
  if (error) return <PageError title="Could not load dashboard" message={error.message} />

  const recentJobs = data?.slice(0, 5) ?? []
  const hasDateApplied = recentJobs.some((j) => Boolean(j.date_applied))
  const hasFollowUp = recentJobs.some((j) => Boolean(j.follow_up_date))
  const hasNextInterview = recentJobs.some((j) => Boolean(j.next_interview_at))
  const statusBreakdown = calculateStatusBreakdown(data ?? [])
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-[14px]">
      {/* Top bar */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Here's how your job search is looking today.
          </p>
        </div>
        <CreateJobDialog
          trigger={
            <button className="flex items-center gap-1.5 rounded-[8px] bg-[#2563EB] px-[14px] py-[8px] text-[13px] font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              New job
            </button>
          }
        />
      </div>

      {/* Stat cards */}
      {analyticsData && <DashboardStatCards data={analyticsData.summary_stats} />}

      {/* Pipeline + Activity */}
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        <StatusChart data={statusBreakdown} />
        <RecentActivity />
      </div>

      {/* Recent jobs */}
      <div className="rounded-[10px] border border-border bg-card">
        <div className="flex items-start justify-between px-5 py-4">
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Recent jobs</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Your latest applications and progress
            </p>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="text-[12px] font-medium text-[#2563EB] hover:underline dark:text-blue-400"
          >
            View all →
          </button>
        </div>
        <RecentJobsTable
          jobs={recentJobs}
          onRowClick={handleView}
          hasDateApplied={hasDateApplied}
          hasFollowUp={hasFollowUp}
          hasNextInterview={hasNextInterview}
        />
      </div>
    </div>
  )
}
