import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type InfoCardProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode
  value: ReactNode
}

export const InfoCard = ({ label, value, className, ...props }: InfoCardProps) => (
  <div
    className={cn(
      'flex justify-between gap-3 rounded-[14px] border border-[rgba(242,229,187,0.06)] bg-[rgba(8,18,13,0.5)] px-3 py-2.5',
      className,
    )}
    {...props}
  >
    <span>{label}</span>
    <strong className="capitalize">{value}</strong>
  </div>
)
