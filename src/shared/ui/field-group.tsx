import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type FieldGroupProps = HTMLAttributes<HTMLDivElement>

export const FieldGroup = ({ className, ...props }: FieldGroupProps) => (
  <div className={cn('grid grid-cols-1 gap-1.5', className)} {...props} />
)

type FieldLabelProps = HTMLAttributes<HTMLLabelElement>

export const FieldLabel = ({ className, ...props }: FieldLabelProps) => (
  <label
    className={cn('text-sm font-medium text-[var(--color-foreground)]', className)}
    {...props}
  />
)
