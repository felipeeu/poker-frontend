import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={cn(
        'min-h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted)] transition-[border-color,background-color,box-shadow] duration-200 focus:border-[var(--color-border-strong)] focus:bg-[color-mix(in_oklab,var(--color-input)_90%,white)] sm:min-h-11',
        className,
      )}
      {...props}
    />
  )
}
