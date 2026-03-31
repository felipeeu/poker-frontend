import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type InfoCardProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode
  value: ReactNode
}

export const InfoCard = ({ label, value, className, ...props }: InfoCardProps) => (
  <div
    className={cn(
      'flex justify-between gap-3 rounded-[14px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] px-3 py-2 sm:py-2.5',
      className,
    )}
    {...props}
  >
    <span className="text-[0.82rem] text-[var(--color-muted)] sm:text-sm">{label}</span>
    <strong className="text-[0.82rem] capitalize text-[var(--color-foreground)] sm:text-sm">{value}</strong>
  </div>
)
