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
              <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                <span className="max-w-24 truncate">
                  {contact.organisation.name}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-3">
            {contact.email && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3" />
                <span className="max-w-36 truncate">{contact.email}</span>
              </span>
            )}
            {contact.phone && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </span>
            )}
            {contact.jobs && contact.jobs.length > 0 && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
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
