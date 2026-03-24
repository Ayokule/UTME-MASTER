import { useState, useMemo } from 'react'

const PAGE_SIZE = 20

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Reset to page 1 when items change (e.g. after filter)
  const safePage = Math.min(page, totalPages)

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  )

  return {
    paged,
    page: safePage,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    next: () => setPage(p => Math.min(p + 1, totalPages)),
    prev: () => setPage(p => Math.max(p - 1, 1)),
    goTo: (n: number) => setPage(Math.max(1, Math.min(n, totalPages))),
    reset: () => setPage(1)
  }
}
