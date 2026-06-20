import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { submitGoogleOAuthForm } from '@/services/api/client'
import {
  deleteAccount,
  deleteAvatar,
  setInitialPassword,
  unlinkGoogle,
  updateNotificationPrefs,
  updatePassword,
  updateProfile,
} from '@/services/api/user'
import {
  Bell,
  Link2,
  Lock,
  Save,
  Trash2,
  TriangleAlert,
  Unlink,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

const inputCls = 'rounded-[7px] text-[13px] h-auto px-[12px] py-[8px]'
const labelCls = 'block text-[11px] font-medium text-muted-foreground mb-[5px]'

export default function ProfilePage() {
  usePageTitle('Profile')
  const { user, updateUser, signout } = useAuth()
  const latestUser = useRef(user)
  latestUser.current = user
  const navigate = useNavigate()
  const isDemo = user?.demo ?? false
  const [searchParams] = useSearchParams()
  const googleTaken = searchParams.get('oauth_error') === 'google_taken'
  const googleDemoBlocked = searchParams.get('oauth_error') === 'demo_account'

  // Google linking
  const [googleLoading, setGoogleLoading] = useState(false)

  // Profile fields
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [location, setLocation] = useState(user?.location || '')
  const [jobTitle, setJobTitle] = useState(user?.job_title || '')
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '')
  const [emailPassword, setEmailPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const emailChanging = email !== (user?.email || '')
  const hasProfileChanges =
    name !== (user?.name || '') ||
    email !== (user?.email || '') ||
    phone !== (user?.phone || '') ||
    location !== (user?.location || '') ||
    jobTitle !== (user?.job_title || '') ||
    linkedinUrl !== (user?.linkedin_url || '')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Notification prefs
  const [notifyFollowUp, setNotifyFollowUp] = useState(
    user?.notify_follow_up_reminders ?? true
  )
  const [notifyInterview, setNotifyInterview] = useState(
    user?.notify_interview_reminders ?? true
  )
  const followUpGenRef = useRef(0)
  const interviewGenRef = useRef(0)

  // Avatar removal
  const [avatarRemoving, setAvatarRemoving] = useState(false)

  // Delete account
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ── Header subtitle ────────────────────────────────────────────────────────
  const subtitle = (() => {
    const parts = [jobTitle, location].filter(Boolean)
    return parts.length > 0 ? parts.join(' · ') : user?.email || ''
  })()

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        name,
        email,
        phone: phone || null,
        location: location || null,
        job_title: jobTitle || null,
        linkedin_url: linkedinUrl || null,
      }
      if (emailChanging) payload.current_password = emailPassword
      const response = await updateProfile(payload)
      updateUser(response.user)
      setEmailPassword('')
      toast.success('Profile updated')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { status?: { message?: string } } }
      }
      setProfileError(
        axiosError.response?.data?.status?.message || 'Failed to update profile'
      )
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { status?: { message?: string } } }
      }
      setPasswordError(
        axiosError.response?.data?.status?.message || 'Failed to update password'
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSetInitialPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      const data = await setInitialPassword({
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      updateUser(data.user)
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password set successfully')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { status?: { message?: string } } }
      }
      setPasswordError(
        axiosError.response?.data?.status?.message || 'Failed to set password'
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleFollowUpToggle = async (value: boolean) => {
    const gen = ++followUpGenRef.current
    setNotifyFollowUp(value)
    try {
      await updateNotificationPrefs({ notify_follow_up_reminders: value })
      if (followUpGenRef.current === gen && latestUser.current) {
        updateUser({ ...latestUser.current, notify_follow_up_reminders: value })
      }
    } catch {
      if (followUpGenRef.current === gen) {
        setNotifyFollowUp(!value)
        if (latestUser.current) {
          updateUser({ ...latestUser.current, notify_follow_up_reminders: !value })
        }
      }
      toast.error('Failed to save preferences')
    }
  }

  const handleInterviewToggle = async (value: boolean) => {
    const gen = ++interviewGenRef.current
    setNotifyInterview(value)
    try {
      await updateNotificationPrefs({ notify_interview_reminders: value })
      if (interviewGenRef.current === gen && latestUser.current) {
        updateUser({ ...latestUser.current, notify_interview_reminders: value })
      }
    } catch {
      if (interviewGenRef.current === gen) {
        setNotifyInterview(!value)
        if (latestUser.current) {
          updateUser({ ...latestUser.current, notify_interview_reminders: !value })
        }
      }
      toast.error('Failed to save preferences')
    }
  }

  const handleRemoveAvatar = async () => {
    if (avatarRemoving) return
    setAvatarRemoving(true)
    try {
      const data = await deleteAvatar()
      updateUser(data.user)
      toast.success('Avatar removed')
    } catch {
      toast.error('Failed to remove avatar')
    } finally {
      setAvatarRemoving(false)
    }
  }

  const handleUnlinkGoogle = async () => {
    if (googleLoading) return
    setGoogleLoading(true)
    try {
      const data = await unlinkGoogle()
      updateUser(data.user)
      toast.success('Google account unlinked')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { status?: { message?: string } } }
      }
      toast.error(
        axiosError.response?.data?.status?.message ||
          'Failed to unlink Google account'
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteLoading) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteAccount(deletePassword)
      await signout()
      navigate('/signin')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { status?: { message?: string } } }
      }
      setDeleteError(
        axiosError.response?.data?.status?.message || 'Failed to delete account'
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-[14px]">

      {/* ── Profile header card ─────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-[10px] overflow-hidden">
        {/* Top section — display */}
        <div className="p-[22px] bg-gradient-to-b from-primary/[0.04] to-card flex items-center gap-[16px]">
          <AvatarUpload user={user} onUpdate={updateUser} onRemove={handleRemoveAvatar} disabled={isDemo || avatarRemoving} />

          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-semibold text-foreground truncate">
              {user?.name || '—'}
            </p>
            <p className="text-[13px] text-muted-foreground truncate mt-[2px]">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Bottom section — form */}
        <div className="border-t border-border/60 p-[20px_22px]">
          {isDemo && (
            <Alert className="mb-[16px]">
              <AlertDescription>
                Demo accounts cannot update their profile.
              </AlertDescription>
            </Alert>
          )}

          {profileError && (
            <Alert variant="destructive" className="mb-[16px]">
              <AlertDescription>{profileError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label htmlFor="profile-name" className={labelCls}>Name</label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profile-email" className={labelCls}>Email</label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profile-phone" className={labelCls}>Phone</label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +61 400 000 000"
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profile-location" className={labelCls}>Location</label>
                <Input
                  id="profile-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Melbourne, VIC"
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profile-job-title" className={labelCls}>Job title</label>
                <Input
                  id="profile-job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Full-stack developer"
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profile-linkedin" className={labelCls}>LinkedIn URL</label>
                <Input
                  id="profile-linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/you"
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
            </div>

            {emailChanging && (
              <div className="mt-[14px]">
                <label htmlFor="email-password" className={labelCls}>
                  Enter your password to confirm email change
                </label>
                <Input
                  id="email-password"
                  type="password"
                  placeholder="••••••••"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            )}

            <div className="mt-[16px]">
              <button
                type="submit"
                disabled={
                  profileLoading ||
                  !hasProfileChanges ||
                  isDemo ||
                  (emailChanging && !emailPassword)
                }
                className="flex items-center gap-1.5 rounded-[8px] bg-brand px-[14px] py-[8px] text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {profileLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Notifications card ──────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-[10px] p-[20px_22px]">
        <div className="flex items-start gap-[10px] mb-[16px]">
          <div className="w-[26px] h-[26px] rounded-[7px] bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-[1px]">
            <Bell className="w-[14px] h-[14px]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Notifications</h2>
            <p className="text-[12px] text-muted-foreground mt-[2px]">
              Choose what you want to be reminded about.
            </p>
          </div>
        </div>

        <div className="ml-[36px] space-y-[14px]">
          <div className="flex items-center justify-between gap-[16px]">
            <div>
              <p id="label-follow-up" className="text-[13px] font-medium text-foreground">Follow-up reminders</p>
              <p className="text-[11px] text-muted-foreground mt-[2px]">
                Notify you when a scheduled follow-up is due on an active application.
              </p>
            </div>
            <Switch
              checked={notifyFollowUp}
              onCheckedChange={handleFollowUpToggle}
              disabled={isDemo}
              aria-labelledby="label-follow-up"
            />
          </div>

          <div className="flex items-center justify-between gap-[16px]">
            <div>
              <p id="label-interview" className="text-[13px] font-medium text-foreground">Interview reminders</p>
              <p className="text-[11px] text-muted-foreground mt-[2px]">
                Notify you 24 hours before an upcoming interview.
              </p>
            </div>
            <Switch
              checked={notifyInterview}
              onCheckedChange={handleInterviewToggle}
              disabled={isDemo}
              aria-labelledby="label-interview"
            />
          </div>
        </div>
      </div>

      {/* ── Password + Connected Accounts — side by side ─────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-[14px] sm:items-stretch">

        {/* Password card */}
        <div className="flex-1 bg-card border border-border rounded-[10px] p-[20px_22px]">
          <div className="flex items-start gap-[10px] mb-[16px]">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-info/10 text-info flex items-center justify-center shrink-0 mt-[1px]">
              <Lock className="w-[13px] h-[13px]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">
                {user?.has_password !== false ? 'Change password' : 'Set a password'}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-[2px]">
                {user?.has_password !== false
                  ? 'Update your password to keep your account secure.'
                  : 'Add a password so you can sign in without Google.'}
              </p>
            </div>
          </div>

          <form
            onSubmit={
              user?.has_password !== false
                ? handlePasswordUpdate
                : handleSetInitialPassword
            }
          >
            {passwordError && (
              <Alert variant="destructive" className="mb-[14px]">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {isDemo && (
              <Alert className="mb-[14px]">
                <AlertDescription>
                  Demo accounts cannot change their password.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-[12px]">
              {user?.has_password !== false && (
                <div>
                  <label htmlFor="current-password" className={labelCls}>
                    Current password
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={isDemo}
                    className={inputCls}
                  />
                </div>
              )}
              <div>
                <label htmlFor="new-password" className={labelCls}>
                  {user?.has_password !== false ? 'New password' : 'Password'}
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className={labelCls}>
                  Confirm password
                </label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isDemo}
                  className={inputCls}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-[8px]">
              Must be at least 6 characters
            </p>

            <div className="mt-[14px]">
              <button
                type="submit"
                disabled={
                  isDemo ||
                  passwordLoading ||
                  (user?.has_password !== false ? !currentPassword : false) ||
                  !newPassword ||
                  !confirmPassword
                }
                className="flex items-center gap-1.5 rounded-[8px] bg-brand px-[14px] py-[8px] text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading
                  ? user?.has_password !== false
                    ? 'Updating...'
                    : 'Setting...'
                  : user?.has_password !== false
                    ? 'Update password'
                    : 'Set password'}
              </button>
            </div>
          </form>
        </div>

        {/* Connected Accounts card */}
        <div className="flex-1 bg-card border border-border rounded-[10px] p-[20px_22px]">
          <div className="flex items-start gap-[10px] mb-[16px]">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-success/10 text-success flex items-center justify-center shrink-0 mt-[1px]">
              <Link2 className="w-[13px] h-[13px]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">
                Connected accounts
              </h2>
              <p className="text-[12px] text-muted-foreground mt-[2px]">
                Sign in faster with a linked account.
              </p>
            </div>
          </div>

          {googleTaken && (
            <Alert variant="destructive" className="mb-[12px]">
              <AlertDescription>
                That Google account is already linked to a different JobJogger account.
              </AlertDescription>
            </Alert>
          )}

          {googleDemoBlocked && (
            <Alert variant="destructive" className="mb-[12px]">
              <AlertDescription>Demo accounts cannot be modified.</AlertDescription>
            </Alert>
          )}

          <div className="border border-border rounded-[9px] p-[12px_14px] flex items-center justify-between gap-[12px]">
            <div className="flex items-center gap-[10px]">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-muted flex items-center justify-center shrink-0">
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground">Google</p>
                <p
                  className={`text-[11px] mt-[1px] ${
                    user?.google_linked ? 'text-success' : 'text-muted-foreground'
                  }`}
                >
                  {user?.google_linked ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>

            {user?.google_linked ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={googleLoading || isDemo}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Unlink
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unlink Google account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {user?.has_password !== false
                        ? "You'll no longer be able to sign in with Google. You can still sign in with your email and password."
                        : 'Set a password first — unlinking Google without one would lock you out of your account.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {user?.has_password !== false && (
                      <AlertDialogAction
                        onClick={handleUnlinkGoogle}
                        disabled={googleLoading}
                      >
                        {googleLoading ? 'Unlinking...' : 'Unlink'}
                      </AlertDialogAction>
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={isDemo}
                onClick={() => submitGoogleOAuthForm({ link: 'true' })}
              >
                <Link2 className="h-3.5 w-3.5" />
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-destructive/20 rounded-[10px] p-[20px_22px]">
        {deleteError && (
          <Alert variant="destructive" className="mb-[14px]">
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[12px]">
          <div className="flex items-start gap-[12px]">
            <TriangleAlert className="h-[18px] w-[18px] text-destructive shrink-0 mt-[1px]" aria-hidden="true" />
            <div>
              <h2 className="text-[14px] font-semibold text-destructive">
                Delete your account
              </h2>
              <p className="text-[12px] text-muted-foreground mt-[2px]">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {isDemo ? (
            <span className="text-[12px] text-muted-foreground">
              Not available for demo accounts
            </span>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="self-start sm:self-auto bg-card text-destructive border border-destructive/30 hover:bg-destructive/5 shadow-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all your job
                    application data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {user?.has_password !== false && (
                  <div className="py-2">
                    <label
                      htmlFor="delete-password"
                      className={labelCls}
                    >
                      Enter your password to confirm
                    </label>
                    <Input
                      id="delete-password"
                      type="password"
                      placeholder="••••••••"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeletePassword('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={
                      deleteLoading ||
                      (user?.has_password !== false ? !deletePassword : false)
                    }
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  )
}
