import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageNumbers(page: number, totalPages: number): number[] {
  const spread = 1
  const pages = new Set<number>([1, totalPages])
  for (let i = page - spread; i <= page + spread; i += 1) {
    if (i > 0 && i <= totalPages) pages.add(i)
  }
  return Array.from(pages).sort((a, b) => a - b)
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageNumbers.map((pageNumber, index) => {
        const previous = pageNumbers[index - 1]
        const showEllipsis = previous !== undefined && pageNumber - previous > 1
        return (
          <span key={pageNumber} className="flex items-center gap-1.5">
            {showEllipsis && <span className="px-1 text-sm text-ink-faint">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={[
                'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                pageNumber === page ? 'bg-primary text-white' : 'text-ink-soft hover:bg-slate-100 hover:text-ink',
              ].join(' ')}
            >
              {pageNumber}
            </button>
          </span>
        )
      })}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export default Pagination
