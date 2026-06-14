import { type HTMLAttributes, type ReactNode } from 'react'

interface TarjetaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  titulo?:   ReactNode
  acciones?: ReactNode
}

export function Tarjeta({
  children,
  titulo,
  acciones,
  className = '',
  ...props
}: TarjetaProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-ambient border border-surface-container p-6 ${className}`}
      {...props}
    >
      {(titulo || acciones) && (
        <div className="flex items-center justify-between mb-5 border-b border-surface-container pb-4">
          {titulo && (
            <h3 className="text-base font-bold text-on-surface font-headline">
              {titulo}
            </h3>
          )}
          {acciones && <div className="flex items-center gap-2">{acciones}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
