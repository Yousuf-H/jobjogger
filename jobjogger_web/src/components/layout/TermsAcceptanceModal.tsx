import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function TermsAcceptanceModal() {
  const { user, acceptTerms } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const open = !!user && !user.demo && !user.terms_agreed_at

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await acceptTerms()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg'
          )}
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              We've added Terms &amp; Conditions
            </h2>
            <p className="text-sm text-muted-foreground">
              By continuing to use JobJogger you agree to our{' '}
              <Link to="/terms" target="_blank" className="text-primary underline underline-offset-4">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" target="_blank" className="text-primary underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" asChild>
              <Link to="/terms" target="_blank">View Terms</Link>
            </Button>
            <Button onClick={handleAccept} disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Accept & Continue'}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  )
}
