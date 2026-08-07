import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function SearchBar({ value, onChange, placeholder, className }: SearchBarProps) {
  return (
    <div
      className={[
        'group flex h-13 items-center gap-3 rounded-2xl border border-border bg-white pl-5 pr-2 shadow-card transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Search className="h-5 w-5 shrink-0 text-ink-faint transition-colors group-focus-within:text-primary" aria-hidden="true" />
      <input
        className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Search…'}
        aria-label="Search"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
