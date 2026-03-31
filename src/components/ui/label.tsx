import type { LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn('text-sm font-medium text-[var(--color-foreground)]', className)}
    {...props}
  />
)
