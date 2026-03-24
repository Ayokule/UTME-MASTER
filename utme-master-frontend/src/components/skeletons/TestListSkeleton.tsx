import LoadingSkeleton from '../ui/LoadingSkeleton'

export default function TestListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <LoadingSkeleton variant="rectangular" height={44} className="rounded-xl" />

      {/* Filter rows */}
      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} variant="rectangular" width={80} height={36} className="rounded-xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} variant="rectangular" width={80} height={36} className="rounded-xl" />
        ))}
      </div>

      {/* Test cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="space-y-2">
              <LoadingSkeleton variant="rectangular" height={18} width="80%" className="rounded" />
              <LoadingSkeleton variant="rectangular" height={14} width="60%" className="rounded" />
              <div className="flex gap-2">
                <LoadingSkeleton variant="rectangular" width={70} height={20} className="rounded-full" />
                <LoadingSkeleton variant="rectangular" width={60} height={20} className="rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, j) => (
                <LoadingSkeleton key={j} variant="rectangular" height={44} className="rounded-lg" />
              ))}
            </div>
            <LoadingSkeleton variant="rectangular" height={36} className="rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
