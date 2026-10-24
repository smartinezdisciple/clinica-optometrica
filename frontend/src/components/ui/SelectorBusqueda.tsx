import { useState, useRef, useEffect } from 'react'
import { BarraBusqueda } from './BarraBusqueda'

interface SelectorBusquedaProps<T> {
  options: T[]
  value: T | null
  onChange: (option: T | null) => void
  getLabel: (option: T) => string
  getKey: (option: T) => string | number
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  loading?: boolean
  label?: string
  error?: string
}

export function SelectorBusqueda<T>({
  options,
  value,
  onChange,
  getLabel,
  getKey,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loading = false,
  label,
  error,
}: SelectorBusquedaProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = search
    ? options.filter((opt) =>
        getLabel(opt).toLowerCase().includes(search.toLowerCase())
      )
    : options

  function handleSelect(opt: T) {
    onChange(opt)
    setOpen(false)
    setSearch('')
  }

  function handleClear() {
    onChange(null)
    setSearch('')
  }

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none transition-all
          ${error
            ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20'
            : 'focus:ring-2 focus:ring-primary/20 focus:border-primary/30'
          }
          ${value ? 'text-on-surface' : 'text-outline'}`}
      >
        <span className={value ? '' : 'text-outline'}>
          {value ? getLabel(value) : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              onClick={(e) => { e.stopPropagation(); handleClear() }}
              className="material-symbols-outlined text-[18px] text-outline hover:text-on-surface cursor-pointer"
            >
              close
            </span>
          )}
          <span className={`material-symbols-outlined text-[20px] text-outline transition-transform ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-surface-container-high rounded-xl shadow-float overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-surface-container">
            <BarraBusqueda
              id="selector-search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-outline">
                <span className="material-symbols-outlined text-2xl">sync</span>
                <p className="text-xs mt-1">Cargando…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-outline">
                <span className="material-symbols-outlined text-2xl">search_off</span>
                <p className="text-xs mt-1">{emptyMessage}</p>
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={getKey(opt)}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-surface-container-low
                    ${value && getKey(value) === getKey(opt) ? 'bg-primary/5 text-primary font-semibold' : 'text-on-surface'}`}
                >
                  {getLabel(opt)}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1 animate-fade-in">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
