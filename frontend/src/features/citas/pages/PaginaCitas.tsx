import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import type { Cita, CitaFormInput } from '../types'
import type { Paciente } from '../../pacientes/types'
import type { Empleado } from '../../usuarios/types'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Modal } from '@/components/ui/Modal'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { CargadorIris } from '@/components/ui/CargadorIris'

interface Slot {
  hora: string
  disponible: boolean
}

export default function PaginaCitas() {
  const queryClient = useQueryClient()

  // State filters
  const [filterFecha, setFilterFecha] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterEmpleado, setFilterEmpleado] = useState<number | ''>('')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)

  // Form State
  const [motivo, setMotivo] = useState('Chequeo general')
  const [idPaciente, setIdPaciente] = useState<number | ''>('')
  const [idEmpleado, setIdEmpleado] = useState<number | ''>('')
  const [fechaCita, setFechaCita] = useState('')
  const [horaCita, setHoraCita] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [formError, setFormError] = useState<Record<string, string>>({})

  // Queries
  const { data: citasResponse, isLoading: isLoadingCitas } = useQuery({
    queryKey: ['citas', filterFecha, filterEstado, filterEmpleado],
    queryFn: () => {
      let url = '/citas?'
      if (filterFecha) url += `fecha=${filterFecha}&`
      if (filterEstado) url += `estado=${filterEstado}&`
      if (filterEmpleado) url += `id_empleado=${filterEmpleado}&`
      return api.get<ApiResponse<Cita[]>>(url)
    },
  })
  const citas = citasResponse?.data ?? []

  // Get all patients for the selector
  const { data: patientsResponse } = useQuery({
    queryKey: ['citas-pacientes'],
    queryFn: () => api.get<ApiResponse<Paciente[]>>('/pacientes'),
  })
  const pacientes = patientsResponse?.data ?? []

  // Get employees to filter and select optometrists
  const { data: employeesResponse } = useQuery({
    queryKey: ['citas-optometristas'],
    queryFn: () => api.get<ApiResponse<Empleado[]>>('/usuarios/empleados'),
  })
  const empleados = employeesResponse?.data ?? []

  // Availability Query
  const { data: slotsResponse, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['citas-disponibilidad', idEmpleado, fechaCita],
    queryFn: () => {
      if (!idEmpleado || !fechaCita) return null
      return api.get<ApiResponse<Slot[]>>(`/citas/disponibilidad?id_empleado=${idEmpleado}&fecha=${fechaCita}`)
    },
    enabled: !!idEmpleado && !!fechaCita,
  })
  const slots = slotsResponse?.data ?? []

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: { id?: number; body: CitaFormInput }) => {
      if (data.id) {
        return api.put<ApiResponse<Cita>>(`/citas/${data.id}`, data.body)
      }
      return api.post<ApiResponse<Cita>>('/citas', data.body)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['citas'] })
      queryClient.invalidateQueries({ queryKey: ['citas-disponibilidad'] })
      toast.success(res.mensaje ?? 'Cita agendada correctamente')
      handleCloseModal()
    },
    onError: (err: any) => {
      toast.error(err.body?.error ?? 'Error al agendar la cita')
    },
  })

  const patchEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      api.patch<ApiResponse<Cita>>(`/citas/${id}/estado`, { estado_cita: estado }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['citas'] })
      toast.success(res.mensaje ?? 'Estado de la cita actualizado')
    },
    onError: (err: any) => {
      toast.error(err.body?.error ?? 'Error al actualizar el estado de la cita')
    },
  })

  const handleOpenModal = (cita?: Cita) => {
    setFormError({})
    if (cita) {
      setSelectedCita(cita)
      setMotivo(cita.motivo_cita)
      setIdPaciente(cita.id_cliente)
      setIdEmpleado(cita.id_empleado ?? '')
      // Formatear fecha y hora
      const date = new Date(cita.fecha_hora_cita)
      const fechaStr = date.toISOString().split('T')[0]
      const hStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      setFechaCita(fechaStr)
      setHoraCita(hStr)
      setObservaciones(cita.observaciones ?? '')
    } else {
      setSelectedCita(null)
      setMotivo('Chequeo general')
      setIdPaciente('')
      setIdEmpleado('')
      setFechaCita('')
      setHoraCita('')
      setObservaciones('')
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCita(null)
    setFormError({})
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError({})

    const errors: Record<string, string> = {}
    if (!idPaciente) errors.id_cliente = 'El paciente es obligatorio'
    if (!idEmpleado) errors.id_empleado = 'El optometrista es obligatorio'
    if (!fechaCita) errors.fecha_cita = 'La fecha es obligatoria'
    if (!horaCita) errors.hora_cita = 'El horario es obligatorio'

    if (Object.keys(errors).length > 0) {
      setFormError(errors)
      return
    }

    // Unir fecha y hora para el formato timestamp
    const timestamp = `${fechaCita}T${horaCita}:00`

    const body: CitaFormInput = {
      motivo_cita: motivo,
      fecha_hora_cita: timestamp,
      id_cliente: Number(idPaciente),
      id_empleado: Number(idEmpleado),
      observaciones: observaciones.trim() || undefined,
    }

    saveMutation.mutate({
      id: selectedCita?.id_cita,
      body,
    })
  }

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'primario'
      case 'completada':
        return 'exito'
      case 'cancelada':
        return 'neutro'
      case 'en_espera_confirmacion':
        return 'advertencia'
      case 'reprogramada':
        return 'info' as any
      default:
        return 'neutro'
    }
  }

  const columns = [
    {
      key: 'fecha_hora',
      label: 'Fecha y Hora',
      render: (row: Cita) => {
        const dateObj = new Date(row.fecha_hora_cita)
        const formatFecha = dateObj.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
        const formatHora = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
        return (
          <div className="flex flex-col">
            <span className="font-bold text-on-surface font-headline">{formatFecha}</span>
            <span className="text-xs text-primary font-semibold">{formatHora}</span>
          </div>
        )
      },
    },
    {
      key: 'paciente',
      label: 'Paciente',
      render: (row: Cita) => (
        <div className="flex flex-col">
          <span className="font-bold text-on-surface">
            {row.paciente_nombre} {row.paciente_apellido}
          </span>
          <span className="text-xs text-outline">{row.paciente_cedula || 'Sin Cédula'}</span>
        </div>
      ),
    },
    {
      key: 'optometrista',
      label: 'Optometrista',
      render: (row: Cita) => (
        <span className="text-sm text-on-surface-variant font-medium">
          {row.optometrista_nombre ? `${row.optometrista_nombre} ${row.optometrista_apellido}` : 'No asignado'}
        </span>
      ),
    },
    { key: 'motivo_cita', label: 'Motivo' },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: Cita) => (
        <Insignia variant={getBadgeVariant(row.estado_cita)}>
          {row.estado_cita.replace(/_/g, ' ')}
        </Insignia>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row: Cita) => (
        <div className="flex justify-end gap-1">
          {row.estado_cita !== 'completada' && row.estado_cita !== 'cancelada' && (
            <>
              <button
                onClick={() => patchEstadoMutation.mutate({ id: row.id_cita, estado: 'completada' })}
                className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all"
                title="Completar Cita"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </button>
              <button
                onClick={() => handleOpenModal(row)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-all"
                title="Reprogramar Cita"
              >
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </button>
              <button
                onClick={() => patchEstadoMutation.mutate({ id: row.id_cita, estado: 'cancelada' })}
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                title="Cancelar Cita"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Agenda de Citas</h1>
          <p className="text-sm text-outline mt-1">Planificación de revisiones visuales, consultas y asignación de optometristas</p>
        </div>
        <Boton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          Agendar Nueva Cita
        </Boton>
      </div>

      {/* Filter Section */}
      <Tarjeta className="mb-6">
        <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Campo
            id="filter-date"
            label="Fecha"
            type="date"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-status" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Estado de la Cita
            </label>
            <select
              id="filter-status"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            >
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="en_espera_confirmacion">En Espera</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-doctor" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Optometrista
            </label>
            <select
              id="filter-doctor"
              value={filterEmpleado}
              onChange={(e) => setFilterEmpleado(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            >
              <option value="">Todos los optometristas</option>
              {empleados.map((emp) => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.primer_nombre} {emp.primer_apellido}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Tarjeta>

      {/* Grid Table */}
      <Tarjeta>
        {isLoadingCitas ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <CargadorIris size={48} />
            <p className="text-sm text-outline mt-4 font-semibold">Cargando citas…</p>
          </div>
        ) : (
          <Tabla
            columns={columns}
            data={citas}
            emptyMessage="No hay citas agendadas que coincidan con los filtros seleccionados."
          />
        )}
      </Tarjeta>

      {/* Scheduler Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        titulo={selectedCita ? 'Reprogramar Cita' : 'Agendar Nueva Cita'}
        maxWith="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cita-paciente" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Paciente
            </label>
            <select
              id="cita-paciente"
              value={idPaciente}
              onChange={(e) => setIdPaciente(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              disabled={saveMutation.isPending || !!selectedCita}
            >
              <option value="">Selecciona un paciente</option>
              {pacientes.map((p) => (
                <option key={p.id_cliente} value={p.id_cliente}>
                  {p.primer_nombre} {p.primer_apellido} {p.cedula ? `— ${p.cedula}` : ''}
                </option>
              ))}
            </select>
            {formError.id_cliente && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {formError.id_cliente}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cita-motivo" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Motivo de la Cita
              </label>
              <select
                id="cita-motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                disabled={saveMutation.isPending}
              >
                <option value="Chequeo general">Chequeo general</option>
                <option value="Control">Control</option>
                <option value="Adaptación de lentes">Adaptación de lentes</option>
                <option value="Urgencia">Urgencia</option>
                <option value="Primera vez">Primera vez</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cita-optometrista" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Optometrista
              </label>
              <select
                id="cita-optometrista"
                value={idEmpleado}
                onChange={(e) => {
                  setIdEmpleado(e.target.value ? Number(e.target.value) : '')
                  setHoraCita('')
                }}
                className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                disabled={saveMutation.isPending}
              >
                <option value="">Selecciona optometrista</option>
                {empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.primer_nombre} {emp.primer_apellido}
                  </option>
                ))}
              </select>
              {formError.id_empleado && (
                <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formError.id_empleado}
                </p>
              )}
            </div>
          </div>

          <Campo
            id="cita-fecha"
            label="Fecha de la Cita"
            type="date"
            value={fechaCita}
            onChange={(e) => {
              setFechaCita(e.target.value)
              setHoraCita('')
            }}
            error={formError.fecha_cita}
            disabled={saveMutation.isPending}
            required
          />

          {/* Availability Grid Selector */}
          {idEmpleado && fechaCita && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Horarios Disponibles
              </label>
              {isLoadingSlots ? (
                <div className="py-6 flex items-center justify-center">
                  <CargadorIris size={28} />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-red-500 font-medium">El profesional no atiende este día.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.hora}
                      type="button"
                      disabled={!s.disponible}
                      onClick={() => setHoraCita(s.hora)}
                      className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all
                        ${!s.disponible
                          ? 'bg-surface-container-high/30 border-transparent text-outline/35 cursor-not-allowed'
                          : horaCita === s.hora
                            ? 'bg-primary border-primary text-white shadow-primary-glow'
                            : 'bg-surface-container-low border-surface-container text-on-surface hover:border-primary/50'
                        }`}
                    >
                      {s.hora}
                    </button>
                  ))}
                </div>
              )}
              {formError.hora_cita && (
                <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formError.hora_cita}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cita-observaciones" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Observaciones / Síntomas
            </label>
            <textarea
              id="cita-observaciones"
              placeholder="Ej: Reporta dolor ocular, visión borrosa..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none h-20"
              disabled={saveMutation.isPending}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-surface-container mt-6">
            <Boton
              type="button"
              variant="secundario"
              onClick={handleCloseModal}
              disabled={saveMutation.isPending}
            >
              Cancelar
            </Boton>
            <Boton type="submit" isLoading={saveMutation.isPending}>
              {selectedCita ? 'Reprogramar' : 'Agendar Cita'}
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
