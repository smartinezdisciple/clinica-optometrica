import { type InputHTMLAttributes, forwardRef } from 'react'

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:        string
  error?:        string
  icon?:         string
  containerClassName?: string
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(
  ({ label, error, icon, className = '', containerClassName = '', id, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full bg-surface-container-low border border-transparent rounded-xl py-3 text-sm outline-none transition-all
              ${icon ? 'pl-10' : 'pl-4'} pr-4
              ${error 
                ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' 
                : 'focus:ring-2 focus:ring-primary/20 focus:border-primary/30'
              }
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1 animate-fade-in">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Campo.displayName = 'Campo'
