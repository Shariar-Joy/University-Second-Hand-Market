import { SearchIcon } from '../icons'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <SearchIcon className={styles.icon} />
      <input
        className={styles.input}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Search…'}
        aria-label="Search"
      />
    </div>
  )
}

export default SearchBar
