import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="py-6 text-center">
      <p className="text-muted-foreground text-xs">
        &copy; {new Date().getFullYear()} JobJogger &middot;{' '}
        <Link
          to="/privacy-policy"
          className="hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Privacy Policy
        </Link>{' '}
        &middot;{' '}
        <Link
          to="/terms"
          className="hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Terms &amp; Conditions
        </Link>
      </p>
    </footer>
  )
}
