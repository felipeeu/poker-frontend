import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: 'default' | 'muted'
}

export const Alert = ({ className, tone = 'default', ...props }: AlertProps) => (
  <div
    className={cn(
      'rounded-[16px] border px-4 py-3 text-sm leading-5 transition-colors duration-200',
      tone === 'default' && 'border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-foreground)]',
      tone === 'muted' && 'border-dashed border-[var(--color-border)] bg-white/[0.015] text-[var(--color-muted)]',
      className,
    )}
    {...props}
  />
)
