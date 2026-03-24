import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

interface ActionsCellProps {
  jobId: number
  isArchived: boolean
  onView?: (id: number) => void
  onArchive: (id: number) => void
  onUnarchive: (id: number) => void
  onDelete: (id: number) => void
}

export default function ActionsCell({
  jobId,
  isArchived,
  onView,
  onArchive,
  onUnarchive,
  onDelete,
}: ActionsCellProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* View */}
          {onView && (
            <DropdownMenuItem onSelect={() => onView(jobId)}>
              View
            </DropdownMenuItem>
          )}

          {/* Archive or Unarchive based on current state */}
          {isArchived ? (
            <DropdownMenuItem onSelect={() => onUnarchive(jobId)}>
              Unarchive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => onArchive(jobId)}>
              Archive
            </DropdownMenuItem>
          )}

          {/* Delete */}
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job application. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(jobId)
                setShowDeleteDialog(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
