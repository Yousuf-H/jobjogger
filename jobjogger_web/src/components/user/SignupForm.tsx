import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { submitGoogleOAuthForm } from '@/services/api/client'
import { IconLock, IconMail, IconUser } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const { signup, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions and Privacy Policy')
      return
    }

    try {
      await signup(email, password, name, agreedToTerms)
      navigate('/')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { status?: { message?: string } } }
      }
      const message = axiosError.response?.data?.status?.message

      if (!navigator.onLine) {
        setError('You appear to be offline. Check your connection and try again.')
      } else if (message) {
        setError(message)
      } else {
        setError('Something went wrong. Please try again later.')
      }
    }
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-foreground" style={{ fontSize: 24, fontWeight: 500 }}>
          Create an account
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: 13 }}>
          Get started with JobJogger for free
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" style={{ fontSize: 13, fontWeight: 500 }}>
            Full name
          </Label>
          <div className="relative">
            <IconUser
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="name"
              type="text"
              placeholder="Joseph Willson"
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" style={{ fontSize: 13, fontWeight: 500 }}>
            Email
          </Label>
          <div className="relative">
            <IconMail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" style={{ fontSize: 13, fontWeight: 500 }}>
            Password
          </Label>
          <div className="relative">
            <IconLock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <p className="text-muted-foreground" style={{ fontSize: 12 }}>
            Must be at least 6 characters
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" style={{ fontSize: 13, fontWeight: 500 }}>
            Confirm password
          </Label>
          <div className="relative">
            <IconLock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="terms"
            className="cursor-pointer text-sm font-normal leading-snug text-muted-foreground"
          >
            I agree to the{' '}
            <Link
              to="/terms"
              className="font-bold hover:underline"
              style={{ color: '#185FA5' }}
              target="_blank"
            >
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy-policy"
              className="font-bold hover:underline"
              style={{ color: '#185FA5' }}
              target="_blank"
            >
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground dark:bg-card">OR</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={() => submitGoogleOAuthForm()}
        >
          <svg
            className="mr-2 h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-muted-foreground" style={{ fontSize: 12 }}>
          By continuing with Google, you agree to our{' '}
          <Link
            to="/terms"
            className="hover:underline"
            style={{ color: '#185FA5' }}
            target="_blank"
          >
            Terms &amp; Conditions
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy-policy"
            className="hover:underline"
            style={{ color: '#185FA5' }}
            target="_blank"
          >
            Privacy Policy
          </Link>
        </p>
      </div>

      <p className="text-center text-muted-foreground" style={{ fontSize: 13 }}>
        Already have an account?{' '}
        <Link
          to="/signin"
          className="font-bold hover:underline"
          style={{ color: '#185FA5' }}
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
