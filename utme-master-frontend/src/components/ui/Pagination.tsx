import { memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

interface Props {
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onNext: () => void
  onPrev: () => void
  onGoTo?: (n: number) => void
  totalItems?: number
  pageSize?: number
}

const Pagination = memo(function Pagination({
  page, totalPages, hasNext, hasPrev, onNext, onPrev, onGoTo,
  totalItems, pageSize = 20
}: Props) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems ?? page * pageSize)

  // Show at most 5 page numbers around current page
  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      {totalItems != null && (
        <p className="text-sm text-gray-600">
          Showing {from}–{to} of {totalItems}
        </p>
      )}

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>

        {start > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => onGoTo?.(1)}>1</Button>
            {start > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {pages.map(n => (
          <Button
            key={n}
            size="sm"
            variant={n === page ? 'primary' : 'outline'}
            onClick={() => onGoTo?.(n)}
          >
            {n}
          </Button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <Button variant="outline" size="sm" onClick={() => onGoTo?.(totalPages)}>{totalPages}</Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
})

export default Pagination
