import { useId, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface FeatureReviewRowProps {
  children: ReactNode
  expanded: boolean
  label: string
  onToggle: () => void
  required?: boolean
  status?: 'AI' | '수정함'
  value: string
}

export function FeatureReviewRow({
  children,
  expanded,
  label,
  onToggle,
  required = false,
  status,
  value,
}: FeatureReviewRowProps) {
  const panelId = useId()

  return (
    <div className="photo-first-form__review-row">
      <button
        aria-controls={panelId}
        aria-expanded={expanded}
        aria-label={[label, required ? '필수' : undefined, value, status].filter(Boolean).join(' ')}
        className="photo-first-form__review-trigger"
        onClick={onToggle}
        type="button"
      >
        <span className="photo-first-form__review-label">
          {label}
          {required && <em>필수</em>}
        </span>
        <strong className={value === '확인하지 못했어요' ? 'is-unconfirmed' : undefined}>
          {value}
        </strong>
        <span className="photo-first-form__review-status">
          {status === 'AI' ? <Badge className="photo-first-form__status-badge">AI</Badge> : status}
        </span>
        <span aria-hidden="true" className="photo-first-form__review-caret">
          <svg fill="none" viewBox="0 0 24 24">
            <path d="m6 9.5 6 6 6-6" />
          </svg>
        </span>
      </button>
      {expanded && (
        <div className="photo-first-form__review-panel" id={panelId}>
          {children}
        </div>
      )}
    </div>
  )
}

export type { FeatureReviewRowProps }
