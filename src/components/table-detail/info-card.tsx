import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type InfoCardProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode
  value: ReactNode
}

export const InfoCard = ({ label, value, className, ...props }: InfoCardProps) => (
  <div
    className={cn(
      'flex justify-between gap-3 rounded-[14px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5',
      className,
    )}
    {...props}
  >
    <span className="text-sm text-[var(--color-muted)]">{label}</span>
    <strong className="text-sm capitalize text-[var(--color-foreground)]">{value}</strong>
  </div>
)
