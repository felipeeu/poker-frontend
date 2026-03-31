import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Avatar = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-white/4',
      className,
    )}
    {...props}
  />
)

export const AvatarFallback = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'flex size-full items-center justify-center text-sm font-semibold text-[var(--color-foreground)]',
      className,
    )}
    {...props}
  />
)
