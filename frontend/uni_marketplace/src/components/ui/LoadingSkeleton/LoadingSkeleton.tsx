function Block({ className }: { className: string }) {
  return <div className={['animate-pulse rounded-lg bg-slate-200/80', className].join(' ')} />
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <Block className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Block className="h-4 w-20" />
        <Block className="h-5 w-4/5" />
        <Block className="h-3.5 w-3/5" />
        <div className="flex items-center justify-between pt-1">
          <Block className="h-5 w-16" />
          <Block className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function TutorCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <Block className="h-14 w-14 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Block className="h-4 w-2/3" />
          <Block className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Block className="h-6 w-16 rounded-full" />
        <Block className="h-6 w-20 rounded-full" />
      </div>
      <Block className="h-10 w-full rounded-xl" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-8 shadow-card">
      <Block className="h-16 w-16 rounded-full" />
      <Block className="h-5 w-40" />
      <Block className="h-3.5 w-28" />
      <div className="mt-4 flex w-full flex-col gap-3">
        <Block className="h-10 w-full" />
        <Block className="h-10 w-full" />
        <Block className="h-10 w-full" />
      </div>
    </div>
  )
}

export function TextLineSkeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return <Block className={className} />
}
