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
      'rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]',
      className,
    )}
    {...props}
  >
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="m-0 text-base font-semibold text-[var(--color-foreground)]">{title}</h3>
    </div>
    {children}
  </div>
)
