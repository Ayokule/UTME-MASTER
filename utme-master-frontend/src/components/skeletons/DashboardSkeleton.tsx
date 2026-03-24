import LoadingSkeleton from '../ui/LoadingSkeleton'

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero banner */}
      <LoadingSkeleton variant="rectangular" height={160} className="rounded-2xl" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} variant="rectangular" height={100} className="rounded-xl" />
        ))}
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} variant="rectangular" height={80} className="rounded-xl" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton variant="rectangular" height={300} className="rounded-xl" />
        <LoadingSkeleton variant="rectangular" height={300} className="rounded-xl" />
      </div>
    </div>
  )
}
