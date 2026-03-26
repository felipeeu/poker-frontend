import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div' | 'aside' | 'header'
}

export const Panel = ({ as = 'section', className, ...props }: PanelProps) => {
  const Component = as
  return (
    <Component
      className={cn(
        'rounded-[28px] border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-md',
        className,
      )}
      {...props}
    />
  )
}
