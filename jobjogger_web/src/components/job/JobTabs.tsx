import { JobContactsTab } from '@/components/job/JobContactsTab'
import { InterviewsTab } from '@/components/job/InterviewsTab'
import { ResumeTab } from '@/components/job/ResumeTab'
import { cn } from '@/lib/utils'
import { useJobContacts } from '@/hooks/useContacts'
import { useInterviews } from '@/hooks/useInterviews'
import type { Job } from '@/types/job'
import type { TimelineEntry } from '@/types/timelineEntry'
import { useState } from 'react'

import { JobInfoTab } from './JobInfoTab'
import { NotesTab } from './NotesTab'
import { TimelineTab } from './TimelineTab'

interface JobTabsProps {
  job: Job
  timelineEntries: TimelineEntry[]
}

type TabKey = 'description' | 'notes' | 'timeline' | 'contacts' | 'interviews' | 'resume'

export function JobTabs({ job, timelineEntries }: JobTabsProps) {
  const { data: jobContacts = [] } = useJobContacts(job.id)
  const { data: interviews = [] } = useInterviews(job.id)
  const showInterviews = job.status !== 'wishlist' || interviews.length > 0
  const [activeTab, setActiveTab] = useState<TabKey>('description')

  const tabs: { key: TabKey; label: string; count?: number; show?: boolean }[] = [
    { key: 'description', label: 'Description' },
    { key: 'notes', label: 'Notes' },
    { key: 'timeline', label: 'Timeline', count: timelineEntries.length },
    { key: 'contacts', label: 'Contacts', count: jobContacts.length },
    { key: 'interviews', label: 'Interviews', count: interviews.length, show: showInterviews },
    { key: 'resume', label: 'Resume' },
  ]

  return (
    <div className="rounded-[10px] border border-border bg-card overflow-hidden">
      {/* Tab bar */}
      <div className="overflow-x-auto border-b border-border px-[16px] flex scrollbar-hide">
        {tabs
          .filter((t) => t.show !== false)
          .map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex shrink-0 items-center gap-[5px] whitespace-nowrap border-b-2 -mb-px px-[12px] py-[11px] text-[12px] cursor-pointer transition-colors',
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB] font-medium dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-[5px] py-[1px] text-[10px] leading-tight',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                        : 'bg-muted text-muted-foreground'
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
      <div className="p-[16px_20px] md:p-[16px_20px]">
        {activeTab === 'description' && <JobInfoTab job={job} />}
        {activeTab === 'notes' && <NotesTab job={job} />}
        {activeTab === 'timeline' && <TimelineTab timelineEntries={timelineEntries} job={job} />}
        {activeTab === 'contacts' && <JobContactsTab jobId={job.id} organisationId={job.organisation_id} />}
        {activeTab === 'interviews' && showInterviews && (
          <InterviewsTab jobId={job.id} status={job.status} organisationId={job.organisation_id ?? null} companyName={job.company_name} />
        )}
        {activeTab === 'resume' && <ResumeTab jobId={job.id} status={job.status} resumeVariantId={job.resume_variant_id} jobTitle={job.job_title} jobDescription={job.job_description} jobAnalysis={job.resume_match_analysis} />}
      </div>
    </div>
  )
}
