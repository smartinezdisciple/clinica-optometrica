import { useState } from 'react'
import { toast } from 'sonner'
import { Boton } from '@/components/ui/Boton'
import { ApiHttpError } from '@/lib/api'
import { descargarReporte } from '../api/reportes.api'
import type { FiltrosReporte, FormatoReporte, TipoReporte } from '../types'

interface BotonExportarProps {
  tipo:    TipoReporte
  filtros: FiltrosReporte
}

export function BotonExportar({ tipo, filtros }: BotonExportarProps) {
  const [formato, setFormato] = useState<FormatoReporte | null>(null)

  async function exportar(seleccionado: FormatoReporte) {
    setFormato(seleccionado)
    try {
      await descargarReporte(tipo, seleccionado, filtros)
      toast.success(`Reporte ${seleccionado.toUpperCase()} descargado`)
    } catch (err) {
      const mensaje = err instanceof ApiHttpError
        ? err.body.error
        : 'No se pudo generar el reporte'
      toast.error(mensaje)
    } finally {
      setFormato(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Boton
        type="button"
        variant="secundario"
        isLoading={formato === 'csv'}
        disabled={formato !== null}
        onClick={() => exportar('csv')}
      >
        <span className="material-symbols-outlined text-[18px]">table_view</span>
        CSV
      </Boton>
      <Boton
        type="button"
        variant="secundario"
        isLoading={formato === 'pdf'}
        disabled={formato !== null}
        onClick={() => exportar('pdf')}
      >
        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
        PDF
      </Boton>
    </div>
  )
}
