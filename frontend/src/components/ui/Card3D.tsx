import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Card3DProps {
  children: ReactNode
  className?: string
}

export function Card3D({ children, className = '' }: Card3DProps) {
  return (
    <motion.div
      className={`relative overflow-hidden transition-colors ${className}`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
