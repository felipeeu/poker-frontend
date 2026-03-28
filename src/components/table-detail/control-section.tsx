import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ControlSectionProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  description?: ReactNode
}

export const ControlSection = ({
  title,
  description,
  className,
  children,
  ...props
}: ControlSectionProps) => (
  <div
    className={cn(
      'rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-3.5',
      className,
    )}
    {...props}
  >
    <h3>{title}</h3>
    {description ? <p className="mt-2.5 text-sm text-[var(--color-muted)]">{description}</p> : null}
    {children}
  </div>
)
