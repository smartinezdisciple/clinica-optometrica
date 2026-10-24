import { CargadorIris } from '@/components/ui/CargadorIris'

export function EstadoReporte({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CargadorIris />
      </div>
    )
  }

  return (
    <div className="py-16 text-center text-sm text-outline">
      No se pudieron cargar los datos del reporte.
    </div>
  )
}
