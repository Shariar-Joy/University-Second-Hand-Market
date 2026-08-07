import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  action?: ReactNode
}

function SectionTitle({ eyebrow, title, subtitle, align = 'left', action }: SectionTitleProps) {
  const isCenter = align === 'center'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
      className={[
        'flex flex-col gap-2',
        isCenter ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
      ].join(' ')}
    >
      <div className={isCenter ? 'max-w-xl' : ''}>
        {eyebrow && <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
      </div>
      {action && !isCenter && <div className="shrink-0">{action}</div>}
    </motion.div>
  )
}

export default SectionTitle
