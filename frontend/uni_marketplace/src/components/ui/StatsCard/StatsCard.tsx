import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import type { LucideProps } from 'lucide-react'

interface StatsCardProps {
  icon: ComponentType<LucideProps>
  value: string
  label: string
  index?: number
}

function StatsCard({ icon: Icon, value, label, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-card backdrop-blur-sm"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-bold text-ink">{value}</span>
        <span className="text-xs font-medium text-ink-soft">{label}</span>
      </div>
    </motion.div>
  )
}

export default StatsCard
