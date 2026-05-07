import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInterviewActions } from '@/hooks/useInterviews'
import {
  INTERVIEW_FORMAT_LABELS,
  INTERVIEW_FORMATS,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPES,
  type InterviewFormat,
  type InterviewType,
} from '@/types/interview'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

interface ScheduleInterviewPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: number
}

export function ScheduleInterviewPrompt({
  open,
  onOpenChange,
  jobId,
}: ScheduleInterviewPromptProps) {
  const { createMutation } = useInterviewActions(jobId)
  const [form, setForm] = useState({
    scheduled_at: '',
    interview_type: 'phone_screen' as InterviewType,
    format: '' as InterviewFormat | '',
    location_or_link: '',
    prep_notes: '',
  })

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = () => {
    createMutation.mutate(
      {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        format: form.format || null,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule an Interview</DialogTitle>
          <DialogDescription>
            You've moved this job to an interview stage. Want to log the details now?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date & Time *</Label>
              <div className="relative">
                <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="datetime-local"
                  className="pl-9"
                  value={form.scheduled_at}
                  onChange={(e) => set('scheduled_at', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={form.interview_type}
                onValueChange={(v) => set('interview_type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {INTERVIEW_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Format</Label>
              <Select
                value={form.format || '__none'}
                onValueChange={(v) => set('format', v === '__none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Not specified</SelectItem>
                  {INTERVIEW_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {INTERVIEW_FORMAT_LABELS[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Location / Link</Label>
              <Input
                placeholder="e.g. Zoom link or office address"
                value={form.location_or_link}
                onChange={(e) => set('location_or_link', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prep Notes</Label>
            <MarkdownEditor
              value={form.prep_notes}
              onChange={(v) => set('prep_notes', v)}
              placeholder="Research, questions to prepare, key talking points… (markdown supported)"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Skip for now
            </Button>
            <Button
              variant="success"
              disabled={createMutation.isPending || !form.scheduled_at}
              onClick={handleSubmit}
            >
              {createMutation.isPending ? 'Saving…' : 'Schedule Interview'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
