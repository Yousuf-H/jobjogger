import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SigninForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signin, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signin(email, password)
      navigate('/')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { error?: string } }
      }

      if (axiosError.response?.status === 401) {
        setError('Invalid email or password. Please try again.')
      } else if (axiosError.response?.data?.error) {
        setError(axiosError.response.data.error)
      } else if (!navigator.onLine) {
        setError(
          'You appear to be offline. Check your connection and try again.'
        )
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
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}
