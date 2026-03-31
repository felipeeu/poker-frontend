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
      'rounded-[16px] border border-[var(--color-border)] bg-[var(--color-panel)] p-3.5 sm:p-4',
      className,
    )}
    {...props}
  >
    <div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-3">
      <h3 className="m-0 text-[0.95rem] font-semibold text-[var(--color-foreground)] sm:text-base">{title}</h3>
    </div>
    {description ? <p className="mb-2.5 text-sm leading-5 text-[var(--color-muted)] sm:mb-3">{description}</p> : null}
    {children}
  </div>
)
