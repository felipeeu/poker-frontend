import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div' | 'aside' | 'header'
}

export const Panel = ({ as = 'section', className, ...props }: PanelProps) => {
  const Component = as
  return (
    <Component
      className={cn(
        'rounded-[18px] border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.16)]',
        className,
      )}
      {...props}
    />
  )
}
