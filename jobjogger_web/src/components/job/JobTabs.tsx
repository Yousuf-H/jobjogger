import { JobContactsTab } from '@/components/job/JobContactsTab'
import { InterviewsTab } from '@/components/job/InterviewsTab'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useJobContacts } from '@/hooks/useContacts'
import { useInterviews } from '@/hooks/useInterviews'
import type { Job } from '@/types/job'
import type { TimelineEntry } from '@/types/timelineEntry'

import { JobInfoTab } from './JobInfoTab'
import { NotesTab } from './NotesTab'
import { TimelineTab } from './TimelineTab'

interface JobTabsProps {
  job: Job
  timelineEntries: TimelineEntry[]
}

export function JobTabs({ job, timelineEntries }: JobTabsProps) {
  const { data: jobContacts = [] } = useJobContacts(job.id)
  const showInterviews = job.status !== 'wishlist'
  const { data: interviews = [] } = useInterviews(showInterviews ? job.id : undefined)
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <Tabs defaultValue="description" className="w-full">
        <div className="px-6 pt-2">
          <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="description"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:border-primary gap-1.5 rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Timeline
              {timelineEntries.length > 0 && (
                <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {timelineEntries.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="data-[state=active]:border-primary gap-1.5 rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Contacts
              {jobContacts.length > 0 && (
                <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {jobContacts.length}
                </span>
              )}
            </TabsTrigger>
            {showInterviews && (
              <TabsTrigger
                value="interviews"
                className="data-[state=active]:border-primary gap-1.5 rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Interviews
                {interviews.length > 0 && (
                  <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                    {interviews.length}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="description" className="mt-0">
            <JobInfoTab job={job} />
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <NotesTab job={job} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <TimelineTab timelineEntries={timelineEntries} job={job} />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <JobContactsTab
              jobId={job.id}
              organisationId={job.organisation_id}
            />
          </TabsContent>

          {showInterviews && (
            <TabsContent value="interviews" className="mt-0">
              <InterviewsTab jobId={job.id} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </Card>
  )
}
