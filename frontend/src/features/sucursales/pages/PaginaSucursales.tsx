import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import type { Sucursal, SucursalFormInput } from '../types'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Modal } from '@/components/ui/Modal'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { CargadorIris } from '@/components/ui/CargadorIris'

export default function PaginaSucursales() {
  const { usuario } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (usuario && usuario.rol !== 'Administrador') {
      toast.error('Acceso denegado. No tienes permisos para ver esta página.')
      navigate('/dashboard')
    }
  }, [usuario, navigate])

  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null)
  
  // State del formulario
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [formError, setFormError] = useState<Record<string, string>>({})

  // Fetch sucursales
  const { data: response, isLoading } = useQuery({
    queryKey: ['sucursales'],
    queryFn: () => api.get<ApiResponse<Sucursal[]>>('/sucursales'),
  })
  const sucursales = response?.data ?? []

  // Mutation para activar/desactivar sucursal
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      api.patch<ApiResponse<Sucursal>>(`/sucursales/${id}/estado`, { activa }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sucursales'] })
      toast.success(res.mensaje ?? 'Estado de la sucursal actualizado')
    },
    onError: (err: any) => {
      const msg = err.body?.error ?? 'No se pudo cambiar el estado de la sucursal'
      toast.error(msg)
    },
  })

  // Mutation para crear/editar sucursal
  const saveMutation = useMutation({
    mutationFn: (data: { id?: number; body: SucursalFormInput }) => {
      if (data.id) {
        return api.put<ApiResponse<Sucursal>>(`/sucursales/${data.id}`, data.body)
      }
      return api.post<ApiResponse<Sucursal>>('/sucursales', data.body)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sucursales'] })
      toast.success(res.mensaje ?? 'Cambios guardados con éxito')
      handleCloseModal()
    },
    onError: (err: any) => {
      if (err.body?.detalles) {
        setFormError(err.body.detalles)
      } else {
        toast.error(err.body?.error ?? 'Error al guardar la sucursal')
      }
    },
  })

  const handleOpenModal = (sucursal?: Sucursal) => {
    setFormError({})
    if (sucursal) {
      setSelectedSucursal(sucursal)
      setNombre(sucursal.nombre)
      setDireccion(sucursal.direccion ?? '')
      setTelefono(sucursal.telefono ?? '')
      setCorreo(sucursal.correo ?? '')
    } else {
      setSelectedSucursal(null)
      setNombre('')
      setDireccion('')
      setTelefono('')
      setCorreo('')
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedSucursal(null)
    setNombre('')
    setDireccion('')
    setTelefono('')
    setCorreo('')
    setFormError({})
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError({})

    // Validaciones básicas en el cliente
    const errors: Record<string, string> = {}
    if (!nombre.trim()) errors.nombre = 'El nombre es obligatorio'
    if (correo && !/^\S+@\S+\.\S+$/.test(correo)) errors.correo = 'El formato del correo es inválido'

    if (Object.keys(errors).length > 0) {
      setFormError(errors)
      return
    }

    saveMutation.mutate({
      id: selectedSucursal?.id_sucursal,
      body: {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
      },
    })
  }

  const activeCount = sucursales.filter((s) => s.activa).length
  const inactiveCount = sucursales.length - activeCount

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (row: Sucursal) => (
        <span className="font-bold text-on-surface font-headline">{row.nombre}</span>
      ),
    },
    { key: 'direccion', label: 'Dirección' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo' },
    {
      key: 'activa',
      label: 'Estado',
      render: (row: Sucursal) => (
        <Insignia variant={row.activa ? 'exito' : 'neutro'}>
          {row.activa ? 'Activa' : 'Inactiva'}
        </Insignia>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row: Sucursal) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal(row)
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title="Editar sucursal"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleEstadoMutation.mutate({ id: row.id_sucursal, activa: !row.activa })
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              row.activa
                ? 'text-red-500 hover:bg-red-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.activa ? 'Desactivar sucursal' : 'Activar sucursal'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {row.activa ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Gestión de Sucursales</h1>
          <p className="text-sm text-outline mt-1">Configuración y sucursales físicas disponibles en el sistema</p>
        </div>
        <Boton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva Sucursal
        </Boton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">domain</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Total Sucursales</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{sucursales.length}</h2>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Activas</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{activeCount}</h2>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">cancel</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Inactivas</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{inactiveCount}</h2>
            </div>
          </div>
        </Tarjeta>
      </div>

      {/* Table Section */}
      <Tarjeta>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <CargadorIris size={48} />
            <p className="text-sm text-outline mt-4 font-semibold">Cargando sucursales…</p>
          </div>
        ) : (
          <Tabla
            columns={columns}
            data={sucursales}
            emptyMessage="No hay sucursales registradas en el sistema."
          />
        )}
      </Tarjeta>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        titulo={selectedSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1" noValidate>
          <Campo
            id="sucursal-nombre"
            label="Nombre de la Sucursal"
            placeholder="Ej: Central Dr. Lentes"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={formError.nombre}
            icon="domain"
            disabled={saveMutation.isPending}
            required
          />

          <Campo
            id="sucursal-direccion"
            label="Dirección"
            placeholder="Ej: Frente a Metrocentro, Managua"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            error={formError.direccion}
            icon="location_on"
            disabled={saveMutation.isPending}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="sucursal-telefono"
              label="Teléfono"
              placeholder="Ej: 2277-1234"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={formError.telefono}
              icon="phone"
              disabled={saveMutation.isPending}
            />

            <Campo
              id="sucursal-correo"
              label="Correo Electrónico"
              placeholder="Ej: central@drlentes.com"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              error={formError.correo}
              icon="mail"
              disabled={saveMutation.isPending}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-container mt-6">
            <Boton
              type="button"
              variant="secundario"
              onClick={handleCloseModal}
              disabled={saveMutation.isPending}
            >
              Cancelar
            </Boton>
            <Boton type="submit" isLoading={saveMutation.isPending}>
              Guardar Sucursal
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
