import { motion } from 'framer-motion'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  children: ReactNode
  hover?: boolean
  padded?: boolean
}

export function Card({ children, className, hover = true, padded = true, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'glass rounded-[20px] shadow-[0_20px_50px_rgb(0_0_0/0.18)]',
        padded && 'p-5 md:p-6',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
