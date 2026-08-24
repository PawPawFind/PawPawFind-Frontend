import './Badge.css'

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  const classes = ['ds-badge', className].filter(Boolean).join(' ')

  return <span className={classes}>{children}</span>
}

export type { BadgeProps }
