import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import type { Paciente, PacienteFormInput, Empresa } from '../types'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { BarraBusqueda } from '@/components/ui/BarraBusqueda'
import { SelectorBusqueda } from '@/components/ui/SelectorBusqueda'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Modal } from '@/components/ui/Modal'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { useEffect } from 'react'

export default function PaginaPacientes() {
  const { usuario } = useAuthStore()
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [quickViewPaciente, setQuickViewPaciente] = useState<Paciente | null>(null)

  // Form states
  const [cedula, setCedula] = useState('')
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [ocupacion, setOcupacion] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [genero, setGenero] = useState<'Masculino' | 'Femenino' | 'Otro' | ''>('')
  const [formError, setFormError] = useState<Record<string, string>>({})

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])
  // Fetching patients list
  const { data: response, isLoading } = useQuery({
    queryKey: ['pacientes', debouncedSearch],
    queryFn: () => api.get<ApiResponse<Paciente[]>>(`/pacientes?search=${encodeURIComponent(debouncedSearch)}`),
    refetchInterval: 15000,
  })

  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const { data: empresasResponse } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => api.get<ApiResponse<Empresa[]>>('/empresas'),
    refetchInterval: 15000,
  })
  const pacientes = response?.data ?? []

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: { id?: number; body: PacienteFormInput }) => {
      if (data.id) {
        return api.put<ApiResponse<Paciente>>(`/pacientes/${data.id}`, data.body)
      }
      return api.post<ApiResponse<Paciente>>('/pacientes', data.body)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      toast.success(res.mensaje ?? 'Paciente guardado exitosamente')
      handleCloseModal()
    },
    onError: (err: any) => {
      if (err.body?.error) {
        toast.error(err.body.error)
      } else {
        toast.error('Error al guardar el paciente')
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete<ApiResponse<void>>(`/pacientes/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      toast.success(res.mensaje ?? 'Paciente eliminado exitosamente')
    },
    onError: (err: any) => {
      toast.error(err.body?.error ?? 'Error al eliminar el paciente')
    },
  })

  const handleOpenModal = (paciente?: Paciente) => {
    setFormError({})
    if (paciente) {
      setSelectedPaciente(paciente)
      setCedula(paciente.cedula ?? '')
      setNombres(paciente.nombres)
      setApellidos(paciente.apellidos)
      setTelefono(paciente.numero_telefono)
      setCorreo(paciente.correo ?? '')
      setOcupacion(paciente.ocupacion ?? '')
      // Formatear fecha a YYYY-MM-DD para el input type="date"
      const fechaStr = paciente.fecha_nacimiento
        ? new Date(paciente.fecha_nacimiento).toISOString().split('T')[0]
        : ''
      setFechaNacimiento(fechaStr)
      setGenero(paciente.genero ?? '')
      // Setear empresa asociada
      if (paciente.id_empresa && empresasResponse?.data) {
        const empresa = empresasResponse.data.find(e => e.id_cliente === paciente.id_empresa)
        setSelectedEmpresa(empresa ?? null)
      } else {
        setSelectedEmpresa(null)
      }
    } else {
      setSelectedPaciente(null)
      setCedula('')
      setNombres('')
      setApellidos('')
      setTelefono('')
      setCorreo('')
      setOcupacion('')
      setFechaNacimiento('')
      setGenero('')
      setSelectedEmpresa(null)
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedPaciente(null)
    setSelectedEmpresa(null)
    setFormError({})
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError({})

    const errors: Record<string, string> = {}
    if (!nombres.trim()) errors.nombres = 'El nombre es obligatorio'
    if (!apellidos.trim()) errors.apellidos = 'El apellido es obligatorio'
    if (!telefono.trim()) errors.numero_telefono = 'El teléfono es obligatorio'
    if (!fechaNacimiento) errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'

    if (Object.keys(errors).length > 0) {
      setFormError(errors)
      return
    }

    const body: PacienteFormInput = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      numero_telefono: telefono.trim(),
      fecha_nacimiento: fechaNacimiento,
    }

    if (cedula.trim()) body.cedula = cedula.trim()
    if (correo.trim()) body.correo = correo.trim()
    if (ocupacion.trim()) body.ocupacion = ocupacion.trim()
    if (genero) body.genero = genero
    if (selectedEmpresa) body.id_empresa = selectedEmpresa.id_cliente
    else body.id_empresa = null

    saveMutation.mutate({
      id: selectedPaciente?.id_cliente,
      body,
    })
  }

  const handleDelete = (id: number) => {
    toast('¿Eliminar paciente? Esta acción es definitiva y no se puede deshacer.', {
      action: { label: 'Eliminar', onClick: () => deleteMutation.mutate(id) },
      cancel: { label: 'Cancelar', onClick: () => {} },
      duration: 8000,
    })
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Paciente',
      render: (row: Paciente) => (
        <div className="flex flex-col">
          <span className="font-bold text-on-surface font-headline">
            {row.nombres} {row.apellidos}
          </span>
          <span className="text-xs text-outline">{row.correo || 'Sin correo electrónico'}</span>
        </div>
      ),
    },
    {
      key: 'cedula',
      label: 'Identificación / Cédula',
      render: (row: Paciente) => (
        <span className="text-sm font-medium text-on-surface-variant font-mono">
          {row.cedula || 'N/D'}
        </span>
      ),
    },
    {
      key: 'fecha_nacimiento',
      label: 'Fecha de Nacimiento',
      render: (row: Paciente) => (
        <div className="flex flex-col">
          <span className="font-bold text-on-surface font-headline">
            {row.fecha_nacimiento}
          </span>
        </div>
      ),
    },
    { key: 'numero_telefono', label: 'Teléfono' },
    {
      key: 'genero',
      label: 'Género',
      render: (row: Paciente) => (
        <span className="text-xs font-semibold">
          {row.genero ? <Insignia variant="neutro">{row.genero}</Insignia> : 'N/D'}
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row: Paciente) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setQuickViewPaciente(row)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title="Vista Rápida"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button
            onClick={() => handleOpenModal(row)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-all"
            title="Editar Paciente"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          {usuario?.rol === 'Administrador' && (
            <button
              onClick={() => handleDelete(row.id_cliente)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
              title="Eliminar Paciente"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      ),
    },
  ]

  const totalPacientes = pacientes.length
  const promedioEdad = totalPacientes > 0
    ? Math.round(pacientes.reduce((acc, p) => {
      const fechaHoy = new Date()
      const fechaNacimientoPaciente = new Date(p.fecha_nacimiento)
      let edad = fechaHoy.getFullYear() - fechaNacimientoPaciente.getFullYear()
      //Si aun no ha cumplido años se le resta 1
      if (fechaHoy < new Date(fechaHoy.getFullYear(), fechaNacimientoPaciente.getMonth(), fechaNacimientoPaciente.getDate())) {
        edad--
      }
      return acc + edad
    }, 0) / totalPacientes)
    : 0

  return (
    <div className="p-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Gestión de Pacientes</h1>
          <p className="text-sm text-outline mt-1">Expedientes de clientes, información demográfica y datos de contacto</p>
        </div>
        <Boton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">person_add</span>
          Registrar Paciente
        </Boton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Total Pacientes</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{totalPacientes}</h2>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">cake</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Edad Promedio</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{promedioEdad} años</h2>
            </div>
          </div>
        </Tarjeta>
      </div>

      {/* Search Bar & Table */}
      <div className="space-y-4">
        <BarraBusqueda
          id="paciente-search"
          placeholder="Buscar por nombre, cédula..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Tarjeta>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <CargadorIris size={48} />
              <p className="text-sm text-outline mt-4 font-semibold">Cargando pacientes…</p>
            </div>
          ) : (
            <Tabla
              columns={columns}
              data={pacientes}
              emptyMessage="No se encontraron pacientes en el sistema."
            />
          )}
        </Tarjeta>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        titulo={selectedPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
        maxWith="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="paciente-nombres"
              label="Nombres"
              placeholder="Ej: Juan Carlos"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              error={formError.nombres}
              disabled={saveMutation.isPending}
              required
            />
            <Campo
              id="paciente-apellidos"
              label="Apellidos"
              placeholder="Ej: Pérez García"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              error={formError.apellidos}
              disabled={saveMutation.isPending}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="paciente-cedula"
              label="Cédula / Identificación"
              placeholder="Ej: 001-010100-0000A"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              disabled={saveMutation.isPending}
            />
            <Campo
              id="paciente-telefono"
              label="Teléfono"
              placeholder="Ej: 8888-8888"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={formError.numero_telefono}
              disabled={saveMutation.isPending}
              required
            />
          </div>

          <Campo
            id="paciente-correo"
            label="Correo Electrónico"
            placeholder="Ej: juan.perez@correo.com"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={saveMutation.isPending}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="paciente-fecha-nac"
              label="Fecha de Nacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              error={formError.fecha_nacimiento}
              disabled={saveMutation.isPending}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="paciente-genero" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Género
              </label>
              <select
                id="paciente-genero"
                value={genero}
                onChange={(e) => setGenero(e.target.value as any)}
                className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                disabled={saveMutation.isPending}
              >
                <option value="">Selecciona género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <Campo
            id="paciente-ocupacion"
            label="Ocupación / Profesión"
            placeholder="Ej: Docente, Ingeniero"
            value={ocupacion}
            onChange={(e) => setOcupacion(e.target.value)}
            disabled={saveMutation.isPending}
          />

          <SelectorBusqueda<Empresa>
            label="Empresa"
            options={empresasResponse?.data ?? []}
            value={selectedEmpresa}
            onChange={setSelectedEmpresa}
            getLabel={(e) => e.razon_social}
            getKey={(e) => e.id_cliente}
            placeholder="Seleccionar empresa"
            searchPlaceholder="Buscar por razón social, RUC..."
            emptyMessage="No se encontraron empresas"
            loading={!empresasResponse}
          />

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
              Guardar Paciente
            </Boton>
          </div>
        </form>
      </Modal>

      {/* Quick View Modal */}
      {quickViewPaciente && (
        <Modal
          isOpen={!!quickViewPaciente}
          onClose={() => setQuickViewPaciente(null)}
          titulo="Información Detallada del Paciente"
          maxWith="md"
        >
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-gradient flex items-center justify-center text-white font-extrabold text-xl shadow-primary-glow">
                {quickViewPaciente.nombres.charAt(0)}
                {quickViewPaciente.apellidos.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-black text-on-surface font-headline">
                  {quickViewPaciente.nombres} {quickViewPaciente.apellidos}
                </h3>
                <span className="text-xs text-outline font-semibold uppercase tracking-wider">
                  Expediente ID: #{quickViewPaciente.id_cliente}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-surface-container py-4">
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Cédula</p>
                <p className="text-sm font-semibold text-on-surface mt-0.5">{quickViewPaciente.cedula || 'No registrada'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Teléfono</p>
                <p className="text-sm font-semibold text-on-surface mt-0.5">{quickViewPaciente.numero_telefono}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Género</p>
                <p className="text-sm font-semibold text-on-surface mt-0.5">{quickViewPaciente.genero || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Fecha Nacimiento</p>
                <p className="text-sm font-semibold text-on-surface mt-0.5">
                  {new Date(quickViewPaciente.fecha_nacimiento).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Correo Electrónico</p>
                <p className="text-sm font-semibold text-on-surface mt-0.5">{quickViewPaciente.correo || 'No registrado'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Ocupación</p>
                <p className="text-sm font-semibold text-on-surface mt-0.5">{quickViewPaciente.ocupacion || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Boton onClick={() => setQuickViewPaciente(null)}>
                Cerrar Vista
              </Boton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
