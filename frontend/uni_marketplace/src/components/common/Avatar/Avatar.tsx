import styles from './Avatar.module.css'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 55%)`
}

function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span className={[styles.avatar, styles[size]].join(' ')} style={{ backgroundColor: colorFor(name) }}>
      {initialsFor(name) || '?'}
    </span>
  )
}

export default Avatar
