import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children:  ReactNode
  variant?:  'primario' | 'secundario' | 'peligro' | 'fantasma'
  isLoading?: boolean
}

export function Boton({
  children,
  variant = 'primario',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: BotonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 outline-none select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none'
  
  const variants = {
    primario: 'bg-primary-gradient text-white shadow-primary-glow hover:shadow-float hover:-translate-y-0.5 active:translate-y-0',
    secundario: 'bg-surface-container hover:bg-surface-container-high text-on-surface hover:-translate-y-0.5 active:translate-y-0',
    peligro: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0',
    fantasma: 'bg-transparent hover:bg-primary/5 text-primary active:scale-95',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
