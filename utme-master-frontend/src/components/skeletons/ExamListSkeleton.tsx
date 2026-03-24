import LoadingSkeleton from '../ui/LoadingSkeleton'

export default function ExamListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <LoadingSkeleton variant="rectangular" height={44} className="flex-1 rounded-xl" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} variant="rectangular" width={70} height={44} className="rounded-xl" />
          ))}
        </div>
      </div>

      {/* Exam cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <LoadingSkeleton variant="rectangular" height={20} width="70%" className="rounded" />
                <div className="flex gap-2">
                  <LoadingSkeleton variant="rectangular" width={60} height={22} className="rounded-full" />
                  <LoadingSkeleton variant="rectangular" width={60} height={22} className="rounded-full" />
                </div>
              </div>
              <LoadingSkeleton variant="rectangular" width={60} height={50} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, j) => (
                <LoadingSkeleton key={j} variant="rectangular" height={56} className="rounded-lg" />
              ))}
            </div>
            <div className="flex gap-3">
              <LoadingSkeleton variant="rectangular" height={40} className="flex-1 rounded-xl" />
              <LoadingSkeleton variant="rectangular" height={40} className="flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
