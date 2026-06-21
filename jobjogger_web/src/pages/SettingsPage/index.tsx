import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'
import { updateNotificationPrefs, updatePreferences } from '@/services/api/user'
import {
  Bell,
  CalendarClock,
  CalendarX,
  Clock,
  Hourglass,
  Mic,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark',  label: 'Dark',  icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export default function SettingsPage() {
  usePageTitle('Settings')
  const { user, updateUser } = useAuth()
  const latestUser = useRef(user)
  latestUser.current = user
  const isDemo = user?.demo ?? false

  const { theme, setTheme } = useTheme()

  // ── Notification toggle state ───────────────────────────────────────────────
  const [notifyFollowUp,   setNotifyFollowUp]   = useState(user?.notify_follow_up_reminders ?? true)
  const [notifyInterview,  setNotifyInterview]  = useState(user?.notify_interview_reminders ?? true)
  const [notifyStageStall, setNotifyStageStall] = useState(user?.notify_stage_stall ?? true)
  const [notifyDeadline,   setNotifyDeadline]   = useState(user?.notify_deadline_reminder ?? true)

  const followUpGenRef   = useRef(0)
  const interviewGenRef  = useRef(0)
  const stageStallGenRef = useRef(0)
  const deadlineGenRef   = useRef(0)

  const [followUpSaving,   setFollowUpSaving]   = useState(false)
  const [interviewSaving,  setInterviewSaving]  = useState(false)
  const [stageStallSaving, setStageStallSaving] = useState(false)
  const [deadlineSaving,   setDeadlineSaving]   = useState(false)

  // ── Follow-up default ───────────────────────────────────────────────────────
  const [followUpDays, setFollowUpDays] = useState(
    String(user?.default_follow_up_days ?? 7)
  )
  const [followUpDaysSaving, setFollowUpDaysSaving] = useState(false)
  const followUpDaysGenRef = useRef(0)

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleThemeSelect = async (value: string) => {
    setTheme(value)
    try {
      const response = await updatePreferences({ theme: value })
      if (latestUser.current) {
        updateUser({ ...latestUser.current, theme: response.user.theme })
      }
    } catch {
      toast.error('Failed to save theme preference')
    }
  }

  const makeToggleHandler = (
    field: 'notify_follow_up_reminders' | 'notify_interview_reminders' | 'notify_stage_stall' | 'notify_deadline_reminder',
    setLocal: (v: boolean) => void,
    setSaving: (v: boolean) => void,
    genRef: React.MutableRefObject<number>
  ) => async (value: boolean) => {
    const gen = ++genRef.current
    setLocal(value)
    setSaving(true)
    try {
      await updateNotificationPrefs({ [field]: value })
      if (genRef.current === gen && latestUser.current) {
        updateUser({ ...latestUser.current, [field]: value })
      }
    } catch {
      if (genRef.current === gen) {
        setLocal(!value)
        if (latestUser.current) {
          updateUser({ ...latestUser.current, [field]: !value })
        }
      }
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleFollowUpToggle  = makeToggleHandler('notify_follow_up_reminders', setNotifyFollowUp,   setFollowUpSaving,   followUpGenRef)
  const handleInterviewToggle = makeToggleHandler('notify_interview_reminders',  setNotifyInterview,  setInterviewSaving,  interviewGenRef)
  const handleStageStallToggle = makeToggleHandler('notify_stage_stall',         setNotifyStageStall, setStageStallSaving, stageStallGenRef)
  const handleDeadlineToggle  = makeToggleHandler('notify_deadline_reminder',    setNotifyDeadline,   setDeadlineSaving,   deadlineGenRef)

  const handleFollowUpDaysSave = async () => {
    const days = parseInt(followUpDays, 10)
    if (isNaN(days) || days < 0) return

    const gen = ++followUpDaysGenRef.current
    setFollowUpDaysSaving(true)
    try {
      const response = await updatePreferences({ default_follow_up_days: days })
      if (followUpDaysGenRef.current === gen && latestUser.current) {
        updateUser({ ...latestUser.current, default_follow_up_days: response.user.default_follow_up_days })
      }
      toast.success('Follow-up default saved')
    } catch {
      toast.error('Failed to save follow-up default')
    } finally {
      setFollowUpDaysSaving(false)
    }
  }

  const parsedDays = parseInt(followUpDays, 10)
  const followUpDaysChanged = !isNaN(parsedDays) && parsedDays >= 0 &&
    parsedDays !== (user?.default_follow_up_days ?? 7)
  const followUpDaysInvalid = isNaN(parsedDays) || parsedDays < 0

  const notifRows = [
    {
      id: 'follow-up',
      icon: Clock,
      label: 'Follow-up reminders',
      desc: 'When a follow-up is due on an active application.',
      checked: notifyFollowUp,
      onCheckedChange: handleFollowUpToggle,
      saving: followUpSaving,
    },
    {
      id: 'interview',
      icon: Mic,
      label: 'Interview reminders',
      desc: '24 hours before an upcoming interview.',
      checked: notifyInterview,
      onCheckedChange: handleInterviewToggle,
      saving: interviewSaving,
    },
    {
      id: 'stage-stall',
      icon: Hourglass,
      label: 'Stalled application alerts',
      desc: 'When an application has had no activity for 14 days.',
      checked: notifyStageStall,
      onCheckedChange: handleStageStallToggle,
      saving: stageStallSaving,
    },
    {
      id: 'deadline',
      icon: CalendarX,
      label: 'Deadline alerts',
      desc: '48 hours before an application deadline.',
      checked: notifyDeadline,
      onCheckedChange: handleDeadlineToggle,
      saving: deadlineSaving,
    },
  ]

  return (
    <div className="flex flex-col gap-[12px]">

      {/* ── Appearance ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-[12px] p-[18px_20px]">
        <h2 className="text-[14px] font-semibold text-foreground">Appearance</h2>
        <p className="text-[12px] text-muted-foreground mt-[2px]">
          Synced across your devices
        </p>

        <div className="bg-secondary p-[4px] rounded-[9px] flex gap-[8px] mt-[14px]">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleThemeSelect(value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-[6px] py-[9px] rounded-[7px] cursor-pointer transition-colors',
                theme === value
                  ? 'bg-card border border-border shadow-sm text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-[15px] h-[15px] shrink-0" />
              <span className={cn('text-[13px]', theme === value ? 'font-semibold' : 'font-medium')}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Notifications ───────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-[12px] p-[18px_20px]">
        <div className="flex items-start gap-[10px] mb-[4px]">
          <div className="w-[26px] h-[26px] rounded-[7px] bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-[1px]">
            <Bell className="w-[14px] h-[14px]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Notifications</h2>
            <p className="text-[12px] text-muted-foreground mt-[2px]">
              Choose what you want to be reminded about
            </p>
          </div>
        </div>

        <div>
          {notifRows.map((row, i) => (
            <div
              key={row.id}
              className={cn(
                'flex items-center justify-between gap-[14px] py-[12px]',
                i < notifRows.length - 1 ? 'border-b border-border' : ''
              )}
            >
              <div className="flex items-center gap-[10px]">
                <row.icon className="w-[15px] h-[15px] text-muted-foreground shrink-0" aria-hidden="true" />
                <div>
                  <p id={`label-${row.id}`} className="text-[13px] font-medium text-foreground">
                    {row.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-[1px]">{row.desc}</p>
                </div>
              </div>
              <Switch
                checked={row.checked}
                onCheckedChange={row.onCheckedChange}
                disabled={isDemo || row.saving}
                aria-labelledby={`label-${row.id}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Follow-up defaults ──────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-[12px] p-[18px_20px]">
        <div className="flex items-start gap-[10px]">
          <div className="w-[26px] h-[26px] rounded-[7px] bg-info/10 text-info flex items-center justify-center shrink-0 mt-[1px]">
            <CalendarClock className="w-[14px] h-[14px]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Follow-up defaults</h2>
            <p className="text-[12px] text-muted-foreground mt-[2px]">
              Auto-set a follow-up date for new jobs
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-[16px]">
          <label htmlFor="follow-up-days" className="text-[13px] text-foreground">
            Follow up after
          </label>
          <div className="flex items-center gap-[8px]">
            <div className="border border-border rounded-[7px] overflow-hidden flex items-stretch">
              <input
                id="follow-up-days"
                type="number"
                min={0}
                max={365}
                value={followUpDays}
                onChange={(e) => setFollowUpDays(e.target.value)}
                disabled={isDemo}
                className="w-[48px] text-center text-[13px] bg-card text-foreground py-[8px] outline-none border-0 shadow-none disabled:opacity-50 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="flex items-center border-l border-border bg-secondary px-[10px] text-[12px] text-muted-foreground select-none">
                days
              </span>
            </div>
            <button
              type="button"
              onClick={handleFollowUpDaysSave}
              disabled={isDemo || followUpDaysSaving || !followUpDaysChanged || followUpDaysInvalid}
              className={cn(
                'rounded-[8px] px-[14px] py-[8px] text-[13px] font-medium transition-colors',
                followUpDaysChanged && !followUpDaysInvalid && !isDemo
                  ? 'bg-brand text-brand-foreground hover:bg-brand/90 cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {followUpDaysSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-[8px]">
          Based on the date applied, or today if no date is set.
        </p>
      </div>

    </div>
  )
}
