import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg border text-sm font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-ring)] active:translate-y-px',
  {
    variants: {
      variant: {
        primary:
          'border-[var(--color-border-strong)] bg-[var(--color-foreground)] px-3.5 py-2 text-sm text-[var(--color-accent-foreground)] hover:bg-[color-mix(in_oklab,var(--color-foreground)_92%,black)] disabled:border-white/8 disabled:bg-white/14 disabled:text-white/40 sm:px-4 sm:py-2.5',
        ghost:
          'border-[var(--color-border)] bg-transparent px-3.5 py-2 text-sm text-[var(--color-foreground)] hover:bg-white/4 disabled:border-white/6 disabled:bg-transparent disabled:text-white/40 sm:px-4 sm:py-2.5',
        danger:
          'border-transparent bg-[var(--color-danger)] px-3.5 py-2 text-sm text-white hover:bg-[color-mix(in_oklab,var(--color-danger)_88%,black)] disabled:border-transparent disabled:bg-[rgba(163,42,42,0.34)] disabled:text-[rgba(255,255,255,0.56)] sm:px-4 sm:py-2.5',
      },
      size: {
        md: 'min-h-10 sm:min-h-11',
        sm: 'min-h-8 px-2.5 py-1.5 text-[0.72rem] sm:min-h-9 sm:px-3 sm:py-2 sm:text-xs',
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
