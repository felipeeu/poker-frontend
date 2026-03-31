import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-border-strong)]',
        className,
      )}
      {...props}
    />
  )
}
