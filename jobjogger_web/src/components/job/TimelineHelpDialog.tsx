import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { getEntryTypeConfig } from '@/lib/timelineEntryStyles'
import { Info } from 'lucide-react'

const entryTypeExamples = [
  {
    type: 'note',
    description: 'General observations, thoughts, reminders',
    examples: [
      'Noticed on their LinkedIn that the CTO previously worked at Canva. Might be worth mentioning my experience with design systems.',
      'Company recently raised Series B funding. Good sign of stability.',
    ],
  },
  {
    type: 'contact',
    description: 'Emails, calls, messages with recruiters/hiring managers',
    examples: [
      'Emailed recruiter to follow up on application status. Asked about timeline for next steps.',
      "Had a brief phone call with Sarah (hiring manager). She confirmed they're moving forward with my application.",
    ],
  },
  {
    type: 'interview',
    description: 'Interview sessions, what was discussed, how it went',
    examples: [
      'Technical interview with two senior engineers. Live coding session building a REST API endpoint. Got stuck on error handling but they were helpful.',
      'Final round with VP of Engineering. Strategic conversation about career goals and company tech roadmap.',
    ],
  },
  {
    type: 'assessment',
    description: 'Take-home challenges, coding tests, presentations',
    examples: [
      'Completed take-home coding challenge. Built a task management app with React + TypeScript. Took about 6 hours.',
      'Finished HackerRank assessment. Got 2/3 correct, struggled with the dynamic programming question.',
    ],
  },
  {
    type: 'follow_up',
    description: 'Actions you need to take or have taken',
    examples: [
      'Need to send references by end of week. Plan to reach out to my manager at previous company.',
      'Sent requested portfolio examples showing React work. Included links to recent projects.',
    ],
  },
]

export default function TimelineHelpDialog() {
  const statusChangeConfig = getEntryTypeConfig('status_change')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Timeline Entry Types</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <p className="text-muted-foreground text-sm">
            Track different types of activities throughout your job application
            process. Here's what each entry type is for:
          </p>

          {entryTypeExamples.map((item) => {
            const config = getEntryTypeConfig(item.type)
            return (
              <div key={item.type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-card ring-1',
                      config.bg,
                      config.ring
                    )}
                  >
                    <config.Icon className={cn('h-[14px] w-[14px]', config.color)} />
                  </div>
                  <span className={cn('text-[13px] font-medium', config.color)}>
                    {config.label}
                  </span>
                </div>

                <p className="text-muted-foreground pl-[34px] text-sm">
                  {item.description}
                </p>

                <div className="space-y-2 pl-[34px]">
                  {item.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="rounded-[8px] border-[0.5px] border-border bg-muted/50 p-3 text-sm"
                    >
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Example {idx + 1}:
                      </p>
                      <p className="text-sm">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="rounded-[8px] border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  'mt-0.5 flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full border-2 border-card ring-1',
                  statusChangeConfig.bg,
                  statusChangeConfig.ring
                )}
              >
                <statusChangeConfig.Icon className={cn('h-[14px] w-[14px]', statusChangeConfig.color)} />
              </div>
              <div>
                <span className={cn('mb-2 block text-[13px] font-medium', statusChangeConfig.color)}>
                  {statusChangeConfig.label}
                </span>
                <p className="text-muted-foreground text-sm">
                  Status changes are automatically created when you update a
                  job's status. You don't need to create these manually.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
