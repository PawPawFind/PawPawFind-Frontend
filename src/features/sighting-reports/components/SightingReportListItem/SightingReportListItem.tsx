import { useEffect, useState } from 'react'
import './SightingReportListItem.css'

interface SightingReportListItemViewModel {
  id: string
  title: string
  speciesLabel: string
  colorText?: string
  sizeLabel?: string
  areaText: string
  dateText: string
  thumbnailUrl?: string
  tags?: readonly string[]
}

interface SightingReportListItemProps {
  report: SightingReportListItemViewModel
  onSelect?: (id: string) => void
}

function Content({ report }: { report: SightingReportListItemViewModel }) {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [report.thumbnailUrl])

  const thumbnailUrl = hasImageError ? undefined : report.thumbnailUrl

  return (
    <>
      <div className="sighting-report-list-item__thumbnail">
        {thumbnailUrl ? (
          <img alt="" onError={() => setHasImageError(true)} src={thumbnailUrl} />
        ) : (
          <span aria-hidden="true">🐾</span>
        )}
      </div>
      <div className="sighting-report-list-item__content">
        <h3>{report.title}</h3>
        <p className="sighting-report-list-item__summary">
          {[report.speciesLabel, report.colorText, report.sizeLabel].filter(Boolean).join(' · ')}
        </p>
        <div className="sighting-report-list-item__meta">
          <span>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 2.5a7 7 0 0 0-7 7c0 5.25 7 12 7 12s7-6.75 7-12a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
            </svg>
            {report.areaText}
          </span>
          <span>
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <rect height="16" rx="2.5" width="18" x="3" y="5" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            {report.dateText}
          </span>
        </div>
        {report.tags && report.tags.length > 0 && (
          <ul aria-label="특징" className="sighting-report-list-item__tags">
            {report.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export function SightingReportListItem({ onSelect, report }: SightingReportListItemProps) {
  return (
    <article
      className={`sighting-report-list-item${onSelect ? ' sighting-report-list-item--interactive' : ''}`}
    >
      <Content report={report} />
      {onSelect && (
        <button
          aria-label={`${report.title} 상세 보기`}
          className="sighting-report-list-item__selection-control"
          onClick={() => onSelect(report.id)}
          type="button"
        />
      )}
    </article>
  )
}

export type { SightingReportListItemProps, SightingReportListItemViewModel }
