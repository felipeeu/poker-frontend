import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

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
      'rounded-[16px] border border-[var(--color-border)] bg-[var(--color-panel)] p-4',
      className,
    )}
    {...props}
  >
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="m-0 text-base font-semibold text-[var(--color-foreground)]">{title}</h3>
    </div>
    {description ? <p className="mb-3 text-sm text-[var(--color-muted)]">{description}</p> : null}
    {children}
  </div>
)
