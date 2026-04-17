import { Card, CardContent } from '@/components/ui/card'
import type { Contact } from '@/types/contact'
import { Briefcase, Building2, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ContactCardProps {
  contact: Contact
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Link to={`/contacts/${contact.id}`}>
      <Card className="hover:border-primary/50 cursor-pointer border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{contact.name}</p>
              {contact.role && (
                <p className="text-muted-foreground truncate text-sm">
                  {contact.role}
                </p>
              )}
            </div>
            {contact.organisation && (
              <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate max-w-24">{contact.organisation.name}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {contact.email && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-36">{contact.email}</span>
              </span>
            )}
            {contact.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </span>
            )}
            {contact.jobs && contact.jobs.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                {contact.jobs.length} job{contact.jobs.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
