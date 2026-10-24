import type { InputHTMLAttributes } from 'react'
import { Campo } from './Campo'

interface BarraBusquedaProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
}

export function BarraBusqueda({ id, placeholder, value, onChange, className, ...props }: BarraBusquedaProps) {
  return (
    <div className="w-full md:w-80">
      <Campo
        id={id}
        placeholder={placeholder}
        icon="search"
        value={value}
        onChange={onChange}
        containerClassName={className}
        {...props}
      />
    </div>
  )
}
