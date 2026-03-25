import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Info } from 'lucide-react'

const entryTypeExamples = [
  {
    type: 'note',
    color: 'bg-yellow-500',
    description: 'General observations, thoughts, reminders',
    examples: [
      'Noticed on their LinkedIn that the CTO previously worked at Canva. Might be worth mentioning my experience with design systems.',
      'Company recently raised Series B funding. Good sign of stability.',
    ],
  },
  {
    type: 'contact',
    color: 'bg-purple-500',
    description: 'Emails, calls, messages with recruiters/hiring managers',
    examples: [
      'Emailed recruiter to follow up on application status. Asked about timeline for next steps.',
      "Had a brief phone call with Sarah (hiring manager). She confirmed they're moving forward with my application.",
    ],
  },
  {
    type: 'interview',
    color: 'bg-green-500',
    description: 'Interview sessions, what was discussed, how it went',
    examples: [
      'Technical interview with two senior engineers. Live coding session building a REST API endpoint. Got stuck on error handling but they were helpful.',
      'Final round with VP of Engineering. Strategic conversation about career goals and company tech roadmap.',
    ],
  },
  {
    type: 'assessment',
    color: 'bg-orange-500',
    description: 'Take-home challenges, coding tests, presentations',
    examples: [
      'Completed take-home coding challenge. Built a task management app with React + TypeScript. Took about 6 hours.',
      'Finished HackerRank assessment. Got 2/3 correct, struggled with the dynamic programming question.',
    ],
  },
  {
    type: 'follow_up',
    color: 'bg-pink-500',
    description: 'Actions you need to take or have taken',
    examples: [
      'Need to send references by end of week. Plan to reach out to my manager at previous company.',
      'Sent requested portfolio examples showing React work. Included links to recent projects.',
    ],
  },
]

export default function TimelineHelpDialog() {
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

          {entryTypeExamples.map((item) => (
            <div key={item.type} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <Badge variant="outline" className="capitalize">
                  {item.type.replace('_', ' ')}
                </Badge>
              </div>

              <p className="text-muted-foreground pl-5 text-sm">
                {item.description}
              </p>

              <div className="space-y-2 pl-5">
                {item.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/50 rounded-lg border p-3 text-sm"
                  >
                    <p className="text-muted-foreground mb-1 text-xs font-medium">
                      Example {idx + 1}:
                    </p>
                    <p className="text-sm">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
              <div>
                <Badge variant="outline" className="mb-2">
                  Status Change
                </Badge>
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
