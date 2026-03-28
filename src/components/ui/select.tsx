import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select
      className={cn(
        'min-h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]',
        className,
      )}
      {...props}
    />
  )
}
