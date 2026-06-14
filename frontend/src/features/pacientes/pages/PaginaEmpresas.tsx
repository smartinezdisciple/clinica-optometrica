import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import type { Empresa, EmpresaFormInput } from '../types'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Modal } from '@/components/ui/Modal'
import { Tabla } from '@/components/ui/Tabla'
import { CargadorIris } from '@/components/ui/CargadorIris'

export default function PaginaEmpresas() {
  const { usuario } = useAuthStore()
  const queryClient = useQueryClient()
  
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)

  // Form states
  const [razonSocial, setRazonSocial] = useState('')
  const [ruc, setRuc] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [primerNombre, setPrimerNombre] = useState('') // Contacto nombre
  const [primerApellido, setPrimerApellido] = useState('') // Contacto apellido
  const [formError, setFormError] = useState<Record<string, string>>({})

  // Fetching companies list
  const { data: response, isLoading } = useQuery({
    queryKey: ['empresas', search],
    queryFn: () => api.get<ApiResponse<Empresa[]>>(`/empresas?search=${encodeURIComponent(search)}`),
  })
  const empresas = response?.data ?? []

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: { id?: number; body: EmpresaFormInput }) => {
      if (data.id) {
        return api.put<ApiResponse<Empresa>>(`/empresas/${data.id}`, data.body)
      }
      return api.post<ApiResponse<Empresa>>('/empresas', data.body)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
      toast.success(res.mensaje ?? 'Empresa guardada exitosamente')
      handleCloseModal()
    },
    onError: (err: any) => {
      toast.error(err.body?.error ?? 'Error al guardar la empresa')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete<ApiResponse<void>>(`/empresas/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
      toast.success(res.mensaje ?? 'Empresa eliminada exitosamente')
    },
    onError: (err: any) => {
      toast.error(err.body?.error ?? 'Error al eliminar la empresa')
    },
  })

  const handleOpenModal = (empresa?: Empresa) => {
    setFormError({})
    if (empresa) {
      setSelectedEmpresa(empresa)
      setRazonSocial(empresa.razon_social)
      setRuc(empresa.ruc)
      setTelefono(empresa.numero_telefono)
      setCorreo(empresa.correo ?? '')
      setPrimerNombre(empresa.primer_nombre)
      setPrimerApellido(empresa.primer_apellido)
    } else {
      setSelectedEmpresa(null)
      setRazonSocial('')
      setRuc('')
      setTelefono('')
      setCorreo('')
      setPrimerNombre('')
      setPrimerApellido('')
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedEmpresa(null)
    setFormError({})
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError({})

    const errors: Record<string, string> = {}
    if (!razonSocial.trim()) errors.razon_social = 'La razón social es obligatoria'
    if (!ruc.trim()) errors.ruc = 'El RUC es obligatorio'
    if (!telefono.trim()) errors.numero_telefono = 'El teléfono de contacto es obligatorio'
    if (!primerNombre.trim()) errors.primer_nombre = 'El nombre del contacto es obligatorio'
    if (!primerApellido.trim()) errors.primer_apellido = 'El apellido del contacto es obligatorio'

    if (Object.keys(errors).length > 0) {
      setFormError(errors)
      return
    }

    const body: EmpresaFormInput = {
      razon_social: razonSocial.trim(),
      ruc: ruc.trim(),
      primer_nombre: primerNombre.trim(),
      primer_apellido: primerApellido.trim(),
      numero_telefono: telefono.trim(),
    }

    if (correo.trim()) body.correo = correo.trim()

    saveMutation.mutate({
      id: selectedEmpresa?.id_cliente,
      body,
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta empresa? Esta acción borrará permanentemente sus registros.')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    { key: 'razon_social', label: 'Razón Social' },
    {
      key: 'ruc',
      label: 'RUC / Registro',
      render: (row: Empresa) => (
        <span className="font-mono text-sm font-semibold text-on-surface-variant">
          {row.ruc}
        </span>
      ),
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (row: Empresa) => (
        <div className="flex flex-col">
          <span className="font-medium text-on-surface">
            {row.primer_nombre} {row.primer_apellido}
          </span>
          <span className="text-xs text-outline">{row.numero_telefono}</span>
        </div>
      ),
    },
    { key: 'correo', label: 'Correo' },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row: Empresa) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleOpenModal(row)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-all"
            title="Editar Empresa"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          {usuario?.rol === 'Administrador' && (
            <button
              onClick={() => handleDelete(row.id_cliente)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
              title="Eliminar Empresa"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
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
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Convenios y Empresas</h1>
          <p className="text-sm text-outline mt-1">Administración de clientes corporativos, convenios colectivos y empresas aliadas</p>
        </div>
        <Boton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">domain_add</span>
          Registrar Empresa
        </Boton>
      </div>

      {/* Stats Summary */}
      <Tarjeta className="mb-8 max-w-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">domain</span>
          </div>
          <div>
            <p className="text-xs text-outline font-semibold uppercase tracking-wider">Empresas Aliadas</p>
            <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{empresas.length}</h2>
          </div>
        </div>
      </Tarjeta>

      {/* Table & Search */}
      <div className="space-y-4">
        <div className="w-full md:w-80">
          <Campo
            id="empresa-search"
            placeholder="Buscar por razón social, RUC..."
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tarjeta>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <CargadorIris size={48} />
              <p className="text-sm text-outline mt-4 font-semibold">Cargando empresas…</p>
            </div>
          ) : (
            <Tabla
              columns={columns}
              data={empresas}
              emptyMessage="No se encontraron empresas registradas."
            />
          )}
        </Tarjeta>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        titulo={selectedEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
        maxWith="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1" noValidate>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-wider mb-2">Datos de la Empresa</h3>
          
          <Campo
            id="empresa-razon-social"
            label="Razón Social"
            placeholder="Ej: Distribuidora Óptica del Norte S.A."
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            error={formError.razon_social}
            disabled={saveMutation.isPending}
            required
          />

          <Campo
            id="empresa-ruc"
            label="Número RUC"
            placeholder="Ej: J031000000001"
            value={ruc}
            onChange={(e) => setRuc(e.target.value)}
            error={formError.ruc}
            disabled={saveMutation.isPending}
            required
          />

          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-wider mb-2 pt-4 border-t border-surface-container">
            Información del Contacto
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="empresa-contacto-nombre"
              label="Nombre del Contacto"
              placeholder="Ej: Carlos"
              value={primerNombre}
              onChange={(e) => setPrimerNombre(e.target.value)}
              error={formError.primer_nombre}
              disabled={saveMutation.isPending}
              required
            />
            <Campo
              id="empresa-contacto-apellido"
              label="Apellido del Contacto"
              placeholder="Ej: Mendoza"
              value={primerApellido}
              onChange={(e) => setPrimerApellido(e.target.value)}
              error={formError.primer_apellido}
              disabled={saveMutation.isPending}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="empresa-contacto-telefono"
              label="Teléfono"
              placeholder="Ej: 2288-9999"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={formError.numero_telefono}
              disabled={saveMutation.isPending}
              required
            />
            <Campo
              id="empresa-contacto-correo"
              label="Correo de Contacto"
              placeholder="Ej: contacto@empresa.com"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
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
              Guardar Empresa
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
