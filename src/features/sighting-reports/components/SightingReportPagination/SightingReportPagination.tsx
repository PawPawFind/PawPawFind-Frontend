import './SightingReportPagination.css'

interface SightingReportPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function SightingReportPagination({
  currentPage,
  disabled = false,
  onPageChange,
  totalPages,
}: SightingReportPaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, index) => index)
  return (
    <nav aria-label="목격 제보 페이지" className="sighting-report-pagination">
      <button
        aria-label="이전 페이지"
        disabled={disabled || currentPage <= 0}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        ←
      </button>
      {pages.map((page) => (
        <button
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`${page + 1}페이지`}
          disabled={disabled}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page + 1}
        </button>
      ))}
      <button
        aria-label="다음 페이지"
        disabled={disabled || currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        →
      </button>
    </nav>
  )
}

export type { SightingReportPaginationProps }
