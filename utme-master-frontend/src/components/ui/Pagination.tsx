import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import Button from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageSize?: boolean
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  totalItems?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageSize = true,
  pageSize = 20,
  onPageSizeChange,
  totalItems
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems || 0)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
      {/* Results Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 order-2 sm:order-1">
        {totalItems && (
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        )}
        
        {/* Page Size Selector */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2 order-1 sm:order-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`dots-${index}`} className="px-3 py-2">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={`min-w-[40px] ${isActive ? '' : 'hover:bg-gray-100'}`}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        {/* Mobile Page Info */}
        <div className="sm:hidden px-3 py-2 text-sm text-gray-700">
          {currentPage} of {totalPages}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center space-x-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}