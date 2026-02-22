import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Job } from '@/types/job'
import type { TimelineEntry } from '@/types/timelineEntry'

import { TimelineTab } from './TimelineTab'
import { JobInfoTab } from './JobInfoTab'
import { NotesTab } from './NotesTab'

interface JobTabsProps {
  job: Job
  timelineEntries: TimelineEntry[]
}

export function JobTabs({ job, timelineEntries }: JobTabsProps) {
  return (
    <Tabs defaultValue="job_info" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="job_info">Job Info</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="job_info">
        <JobInfoTab job={job} />
      </TabsContent>

      <TabsContent value="notes">
        <NotesTab job={job} />
      </TabsContent>

      <TabsContent value="timeline">
        <TimelineTab timelineEntries={timelineEntries} />
      </TabsContent>
    </Tabs>
  )
}
