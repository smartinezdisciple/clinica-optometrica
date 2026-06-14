// Spinner animado temático "Iris" — CargadorIris.tsx
export function CargadorIris({ size = 48 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" fill="none" width={size} height={size}>
        {/* Anillo exterior */}
        <circle cx="24" cy="24" r="20" stroke="#eceef0" strokeWidth="4" />
        <circle
          cx="24" cy="24" r="20"
          stroke="url(#iris-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="100 26"
          className="animate-iris-spin origin-center"
          style={{ transformOrigin: '24px 24px' }}
        />
        {/* Anillo interior */}
        <circle cx="24" cy="24" r="12" stroke="#eceef0" strokeWidth="3" />
        <circle
          cx="24" cy="24" r="12"
          stroke="url(#iris-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="50 26"
          className="animate-iris-spin origin-center"
          style={{
            transformOrigin: '24px 24px',
            animationDirection: 'reverse',
            animationDuration: '0.9s',
          }}
        />
        {/* Punto central */}
        <circle cx="24" cy="24" r="3" fill="#00658d" />
        <defs>
          <linearGradient id="iris-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00658d" />
            <stop offset="100%" stopColor="#00aeef" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
