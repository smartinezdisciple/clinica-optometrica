import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useEffect } from 'react'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import type { LogAuditoria, ListarLogsResponse, TipoEvento } from '../types'
import { TIPOS_EVENTO } from '../types'

const TIPO_VARIANT: Record<TipoEvento, 'exito' | 'advertencia' | 'error' | 'neutro' | 'primario'> = {
  CREATE:      'exito',
  UPDATE:      'primario',
  DELETE:      'error',
  LOGIN:       'exito',
  LOGIN_FAILED: 'error',
  LOGOUT:      'neutro',
  EXPORT:      'advertencia',
  CONFIG:      'advertencia',
}

const TIPO_LABEL: Record<TipoEvento, string> = {
  CREATE:       'CREATE',
  UPDATE:       'UPDATE',
  DELETE:       'DELETE',
  LOGIN:        'LOGIN',
  LOGIN_FAILED: 'LOGIN_FALLIDO',
  LOGOUT:       'LOGOUT',
  EXPORT:       'EXPORT',
  CONFIG:       'CONFIG',
}

function formatearFecha(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PaginaAuditoria() {
  const { usuario } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (usuario && usuario.rol !== 'Administrador') {
      toast.error('Acceso denegado. No tienes permisos para ver esta página.')
      navigate('/dashboard')
    }
  }, [usuario, navigate])

  const [pagina, setPagina] = useState(1)
  const [limite] = useState(20)
  const [busqueda, setBusqueda] = useState('')
  const [aplicarBusqueda, setAplicarBusqueda] = useState('')
  const [tipoEvento, setTipoEvento] = useState('')
  const [modulo, setModulo] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const construirQuery = () => {
    const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) })
    if (aplicarBusqueda.trim()) params.set('busqueda', aplicarBusqueda.trim())
    if (tipoEvento) params.set('tipo_evento', tipoEvento)
    if (modulo) params.set('modulo', modulo)
    if (fechaDesde) params.set('fecha_desde', fechaDesde)
    if (fechaHasta) params.set('fecha_hasta', fechaHasta)
    return params.toString()
  }

  const { data: response, isLoading, isFetching } = useQuery({
    queryKey: ['auditoria', pagina, aplicarBusqueda, tipoEvento, modulo, fechaDesde, fechaHasta],
    queryFn: () => api.get<ApiResponse<ListarLogsResponse>>(`/auditoria?${construirQuery()}`),
  })

  const logs = response?.data.items ?? []
  const totalPaginas = response?.data.totalPaginas ?? 1

  const aplicarFiltros = () => {
    setPagina(1)
    setAplicarBusqueda(busqueda)
  }

  const columnas = [
    {
      key: 'fecha_evento',
      label: 'Fecha',
      render: (row: LogAuditoria) => (
        <span className="text-xs font-semibold text-on-surface">{formatearFecha(row.fecha_evento)}</span>
      ),
    },
    {
      key: 'nombre_usuario',
      label: 'Usuario',
      render: (row: LogAuditoria) => row.nombre_usuario ?? '-',
    },
    {
      key: 'tipo_evento',
      label: 'Tipo',
      render: (row: LogAuditoria) => (
        <Insignia variant={TIPO_VARIANT[row.tipo_evento ?? 'CREATE']}>
          {row.tipo_evento ? TIPO_LABEL[row.tipo_evento] : '-'}
        </Insignia>
      ),
    },
    {
      key: 'modulo',
      label: 'Módulo',
      render: (row: LogAuditoria) => (
        <span className="text-xs font-bold uppercase tracking-wide text-primary">{row.modulo}</span>
      ),
    },
    { key: 'accion', label: 'Acción' },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (row: LogAuditoria) => (
        <span className="block truncate max-w-[260px]" title={row.descripcion ?? ''}>
          {row.descripcion ?? '-'}
        </span>
      ),
    },
    {
      key: 'ip_origen',
      label: 'IP',
      render: (row: LogAuditoria) => (
        <span className="text-xs font-mono text-outline">{row.ip_origen ?? '-'}</span>
      ),
    },
  ]

  return (
    <div className="p-8 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Auditoría del Sistema</h1>
          <p className="text-sm text-outline mt-1">Registro de eventos relevantes en la operación del sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-outline">
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
          Solo administradores
        </div>
      </div>

      {/* Filtros */}
      <Tarjeta className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Campo
            id="audit-busqueda"
            label="Búsqueda"
            placeholder="Acción, descripción o usuario…"
            icon="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltros() }}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="audit-tipo" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Tipo de evento
            </label>
            <div className="relative">
              <select
                id="audit-tipo"
                value={tipoEvento}
                onChange={(e) => { setTipoEvento(e.target.value); setAplicarBusqueda(busqueda) }}
                className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 pl-4 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              >
                <option value="">Todos</option>
                {TIPOS_EVENTO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Campo
            id="audit-modulo"
            label="Módulo"
            placeholder="Ej: usuarios, citas"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
          />
          <Campo
            id="audit-desde"
            label="Desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <Campo
            id="audit-hasta"
            label="Hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Boton onClick={aplicarFiltros} variant="primario" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_alt</span>
            Aplicar filtros
          </Boton>
        </div>
      </Tarjeta>

      {/* Tabla */}
      <Tarjeta>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <CargadorIris size={48} />
            <p className="text-sm text-outline mt-4 font-semibold">Cargando registros de auditoría…</p>
          </div>
        ) : (
          <Tabla
            columns={columnas}
            data={logs}
            emptyMessage="No hay registros de auditoría que coincidan con los filtros."
          />
        )}
        {isFetching && !isLoading && (
          <div className="py-4 text-center text-xs text-outline">Actualizando registros…</div>
        )}
      </Tarjeta>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-outline">
          Página {response?.data.pagina ?? 1} de {totalPaginas} · {response?.data.total ?? 0} registros
        </p>
        <div className="flex gap-2">
          <Boton
            variant="secundario"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina <= 1}
          >
            Anterior
          </Boton>
          <Boton
            variant="secundario"
            onClick={() => setPagina((p) => p + 1)}
            disabled={pagina >= totalPaginas}
          >
            Siguiente
          </Boton>
        </div>
      </div>
    </div>
  )
}