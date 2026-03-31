import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-ring)]',
  {
    variants: {
      variant: {
        primary:
          'border-[var(--color-border-strong)] bg-[var(--color-foreground)] px-4 py-2.5 text-[var(--color-accent-foreground)] hover:bg-[color-mix(in_oklab,var(--color-foreground)_92%,black)] disabled:border-white/8 disabled:bg-white/14 disabled:text-white/40',
        ghost:
          'border-[var(--color-border)] bg-transparent px-4 py-2.5 text-[var(--color-foreground)] hover:bg-white/4 disabled:border-white/6 disabled:bg-transparent disabled:text-white/40',
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
