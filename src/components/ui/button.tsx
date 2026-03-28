import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-ring)]',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-[var(--color-accent)] px-4 py-2.5 text-[var(--color-accent-foreground)] hover:bg-[color-mix(in_oklab,var(--color-accent)_88%,black)] disabled:border-[rgba(217,177,95,0.12)] disabled:bg-[rgba(217,177,95,0.22)] disabled:text-[rgba(247,236,214,0.52)] disabled:shadow-none',
        ghost:
          'border-[var(--color-border-strong)] bg-white/5 px-4 py-2.5 text-[var(--color-foreground)] hover:bg-white/10 disabled:border-white/6 disabled:bg-white/[0.03] disabled:text-[rgba(247,236,214,0.45)]',
        danger:
          'border-transparent bg-[var(--color-danger)] px-4 py-2.5 text-white hover:bg-[color-mix(in_oklab,var(--color-danger)_88%,black)] disabled:border-transparent disabled:bg-[rgba(163,42,42,0.34)] disabled:text-[rgba(255,255,255,0.56)]',
      },
      size: {
        md: 'min-h-11',
        sm: 'min-h-9 px-3 py-2 text-xs',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = ({ className, variant, size, fullWidth, ...props }: ButtonProps) => {
  return <button className={cn(buttonVariants({ variant, size, fullWidth }), className)} {...props} />
}
