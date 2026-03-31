import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.08em]',
  {
    variants: {
      variant: {
        neutral: 'border-[var(--color-border)] bg-transparent text-[var(--color-muted)]',
        accent: 'border-[var(--color-border-strong)] bg-white/4 text-[var(--color-foreground)]',
        success: 'border-emerald-300/18 bg-emerald-300/8 text-emerald-100',
        warning: 'border-amber-200/18 bg-amber-200/8 text-amber-50',
        danger: 'border-rose-300/18 bg-rose-300/8 text-rose-100',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
