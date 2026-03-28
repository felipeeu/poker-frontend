import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]',
  {
    variants: {
      variant: {
        neutral: 'border-white/10 bg-white/5 text-[var(--color-foreground)]',
        accent: 'border-[color-mix(in_oklab,var(--color-accent)_32%,transparent)] bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]',
        success: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200',
        warning: 'border-amber-300/30 bg-amber-300/12 text-amber-100',
        danger: 'border-rose-400/30 bg-rose-400/12 text-rose-100',
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
