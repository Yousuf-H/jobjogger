import { Skeleton } from '@/components/ui/skeleton'

type PageLoadingVariant =
  | 'default'
  | 'dashboard'
  | 'analytics'
  | 'detail'
  | 'table'

interface PageLoadingProps {
  variant?: PageLoadingVariant
}

export function PageLoading({ variant = 'default' }: PageLoadingProps) {
  return (
    <div className="space-y-[14px]">
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'analytics' && <AnalyticsSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'default' && <DefaultSkeleton />}
    </div>
  )
}

function DefaultSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-48 rounded-md" />
      <Skeleton className="h-[300px] rounded-lg" />
    </>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-[160px] rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[280px] rounded-lg" />
      <Skeleton className="h-[320px] rounded-lg" />
    </>
  )
}

function AnalyticsSkeleton() {
  return (
    <>
      <div>
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="mt-1.5 h-4 w-52 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-[10px]" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-[10px]" />
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        <Skeleton className="h-[260px] rounded-[10px]" />
        <Skeleton className="h-[260px] rounded-[10px]" />
      </div>
      <Skeleton className="h-[220px] rounded-[10px]" />
    </>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="h-8 w-32 rounded-md" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-10 w-72 rounded-md" />
        <Skeleton className="h-5 w-48 rounded-md" />
      </div>
      <Skeleton className="mt-6 h-[280px] rounded-lg" />
      <Skeleton className="mt-6 h-[400px] rounded-lg" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-[500px] rounded-lg" />
    </>
  )
}
