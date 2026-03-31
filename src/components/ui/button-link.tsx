import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { buttonVariants } from '@/components/ui/button'

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'md' | 'sm'
  fullWidth?: boolean
}

export const ButtonLink = ({
  className,
  variant,
  size,
  fullWidth,
  ...props
}: ButtonLinkProps) => (
  <Link
    className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    {...props}
  />
)
