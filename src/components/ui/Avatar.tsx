import React from 'react'
import { cn, getAvatarColor, getInitials } from '@/utils/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className }) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center select-none shadow-sm',
        sizeStyles[size],
        getAvatarColor(name || 'User'),
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
