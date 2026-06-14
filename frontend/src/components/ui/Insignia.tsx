import { type ReactNode } from 'react'

interface InsigniaProps {
  children: ReactNode
  variant?: 'exito' | 'advertencia' | 'error' | 'neutro' | 'primario'
  className?: string
}

export function Insignia({
  children,
  variant = 'neutro',
  className = '',
}: InsigniaProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold select-none'

  const variants = {
    primario: 'bg-primary/10 text-primary',
    exito: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    advertencia: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-100',
    neutro: 'bg-slate-100 text-slate-700',
  }

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
