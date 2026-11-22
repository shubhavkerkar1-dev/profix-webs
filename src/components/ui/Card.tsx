import React from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
