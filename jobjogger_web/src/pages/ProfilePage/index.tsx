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
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { googleOAuthUrl } from '@/services/api/client'
import {
  deleteAccount,
  unlinkGoogle,
  updatePassword,
  updateProfile,
} from '@/services/api/user'
import { Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function ProfilePage() {
  usePageTitle('Profile')
  const { user, updateUser, signout } = useAuth()
  const navigate = useNavigate()
  const isDemo = user?.demo ?? false
  const [searchParams] = useSearchParams()
  const googleTaken = searchParams.get('oauth_error') === 'google_taken'

  // Google linking state
  const [googleLoading, setGoogleLoading] = useState(false)

  // Profile state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [emailPassword, setEmailPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const emailChanging = email !== (user?.email || '')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Delete state
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const hasProfileChanges =
    name !== (user?.name || '') || email !== (user?.email || '')

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')

    try {
      const payload: { name: string; email: string; current_password?: string } =
        { name, email }
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
        axiosError.response?.data?.status?.message ||
          'Failed to update password'
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleUnlinkGoogle = async () => {
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
        axiosError.response?.data?.status?.message || 'Failed to unlink Google account'
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
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

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal information and account.
        </p>
      </div>

      {/* Avatar + Name/Email */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {profileError && (
              <Alert variant="destructive">
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}

            {isDemo && (
              <Alert>
                <AlertDescription>
                  Demo accounts cannot update their avatar, name, or email.
                </AlertDescription>
              </Alert>
            )}

            <AvatarUpload user={user} onUpdate={updateUser} disabled={isDemo} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isDemo}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isDemo}
                />
              </div>
            </div>

            {emailChanging && (
              <div className="space-y-2">
                <Label htmlFor="email-password">
                  Enter your password to confirm email change
                </Label>
                <Input
                  id="email-password"
                  type="password"
                  placeholder="••••••••"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant="success"
              disabled={
                profileLoading ||
                !hasProfileChanges ||
                isDemo ||
                (emailChanging && !emailPassword)
              }
              size="sm"
            >
              <Save className="mr-2 h-4 w-4" />
              {profileLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Change password</h2>
            <p className="text-muted-foreground text-sm">
              Update your password to keep your account secure.
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {isDemo && (
              <Alert>
                <AlertDescription>
                  Demo accounts cannot change their password.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isDemo}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isDemo}
                />
                <p className="text-muted-foreground text-xs">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isDemo}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="success"
              disabled={
                isDemo ||
                passwordLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              size="sm"
            >
              {passwordLoading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Connected accounts */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Connected accounts</h2>
            <p className="text-muted-foreground text-sm">
              Link a Google account to sign in without a password.
            </p>
          </div>

          {googleTaken && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                That Google account is already linked to a different JobJogger account.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-muted-foreground text-xs">
                  {user?.google_linked ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>

            {user?.google_linked ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={googleLoading || isDemo}>
                    Unlink
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unlink Google account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {user?.has_password
                        ? 'You\'ll no longer be able to sign in with Google. You can still sign in with your email and password.'
                        : 'Set a password first — unlinking Google without one would lock you out of your account.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {user?.has_password && (
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
                disabled={isDemo}
                onClick={() => { window.location.href = `${googleOAuthUrl}?link=true` }}
              >
                Link Google account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-destructive text-lg font-semibold">
              Danger zone
            </h2>
            <p className="text-muted-foreground text-sm">
              This action is permanent and cannot be undone.
            </p>
          </div>

          {deleteError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          {isDemo ? (
            <Alert>
              <AlertDescription>
                Demo accounts cannot be deleted.
              </AlertDescription>
            </Alert>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all your job
                    application data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-2">
                  <Label htmlFor="delete-password">
                    Enter your password to confirm
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="••••••••"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeletePassword('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || !deletePassword}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
