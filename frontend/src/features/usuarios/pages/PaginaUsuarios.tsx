import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import type { UsuarioDetalle, Rol, UsuarioFormInput } from '../types'
import type { Sucursal } from '../../sucursales/types'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Modal } from '@/components/ui/Modal'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { CargadorIris } from '@/components/ui/CargadorIris'

export default function PaginaUsuarios() {
  const { usuario: currentUser } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser && currentUser.rol !== 'Administrador') {
      toast.error('Acceso denegado. No tienes permisos para ver esta página.')
      navigate('/dashboard')
    }
  }, [currentUser, navigate])

  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioDetalle | null>(null)

  // Form states
  const [primerNombre, setPrimerNombre] = useState('')
  const [segundoNombre, setSegundoNombre] = useState('')
  const [primerApellido, setPrimerApellido] = useState('')
  const [segundoApellido, setSegundoApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [idSucursal, setIdSucursal] = useState<number | ''>('')
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [idRol, setIdRol] = useState<number | ''>('')
  const [formError, setFormError] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  // Queries
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.get<ApiResponse<UsuarioDetalle[]>>('/usuarios'),
  })
  const usuarios = usersResponse?.data ?? []

  const { data: rolesResponse } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get<ApiResponse<Rol[]>>('/usuarios/roles'),
  })
  const roles = rolesResponse?.data ?? []

  const { data: sucursalesResponse } = useQuery({
    queryKey: ['sucursales-activas'],
    queryFn: () => api.get<ApiResponse<Sucursal[]>>('/sucursales?activas=true'),
  })
  const sucursales = sucursalesResponse?.data ?? []

  // Mutations
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      api.patch<ApiResponse<void>>(`/usuarios/${id}/estado`, { activo }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success(res.mensaje ?? 'Estado del usuario actualizado')
    },
    onError: (err: any) => {
      toast.error(err.body?.error ?? 'Error al actualizar el estado del usuario')
    },
  })

  const unlockMutation = useMutation({
    mutationFn: (id: number) =>
      api.patch<ApiResponse<void>>(`/usuarios/${id}/desbloquear`, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success(res.mensaje ?? 'Usuario desbloqueado con éxito')
    },
    onError: (err: any) => {
      toast.error(err.body?.error ?? 'Error al desbloquear el usuario')
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: { id?: number; body: UsuarioFormInput }) => {
      if (data.id) {
        return api.put<ApiResponse<UsuarioDetalle>>(`/usuarios/${data.id}`, data.body)
      }
      return api.post<ApiResponse<UsuarioDetalle>>('/usuarios', data.body)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success(res.mensaje ?? 'Usuario guardado exitosamente')
      handleCloseModal()
    },
    onError: (err: any) => {
      if (err.body?.detalles) {
        setFormError(err.body.detalles)
      } else {
        toast.error(err.body?.error ?? 'Error al guardar el usuario')
      }
    },
  })

  const handleOpenModal = (user?: UsuarioDetalle) => {
    setFormError({})
    if (user) {
      setSelectedUser(user)
      setPrimerNombre(user.primer_nombre)
      setSegundoNombre(user.segundo_nombre ?? '')
      setPrimerApellido(user.primer_apellido)
      setSegundoApellido(user.segundo_apellido ?? '')
      setTelefono(user.numero_telefono ?? '')
      setCorreo(user.correo ?? '')
      setIdSucursal(user.id_sucursal ?? '')
      setNombreUsuario(user.nombre_usuario)
      setContrasena('')
      setIdRol(user.id_rol)
    } else {
      setSelectedUser(null)
      setPrimerNombre('')
      setSegundoNombre('')
      setPrimerApellido('')
      setSegundoApellido('')
      setTelefono('')
      setCorreo('')
      setIdSucursal('')
      setNombreUsuario('')
      setContrasena('')
      setIdRol('')
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
    setFormError({})
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError({})

    const errors: Record<string, string> = {}
    if (!primerNombre.trim()) errors.primer_nombre = 'El primer nombre es obligatorio'
    if (!primerApellido.trim()) errors.primer_apellido = 'El primer apellido es obligatorio'
    if (!idSucursal) errors.id_sucursal = 'La sucursal es obligatoria'
    if (!nombreUsuario.trim()) errors.nombre_usuario = 'El nombre de usuario es obligatorio'
    if (!selectedUser && !contrasena) errors.contrasena = 'La contraseña es obligatoria'
    if (!idRol) errors.id_rol = 'El rol es obligatorio'
    if (correo && !/^\S+@\S+\.\S+$/.test(correo)) errors.correo = 'Formato de correo inválido'

    if (Object.keys(errors).length > 0) {
      setFormError(errors)
      return
    }

    const body: UsuarioFormInput = {
      primer_nombre: primerNombre.trim(),
      segundo_nombre: segundoNombre.trim(),
      primer_apellido: primerApellido.trim(),
      segundo_apellido: segundoApellido.trim(),
      numero_telefono: telefono.trim(),
      correo: correo.trim(),
      id_sucursal: Number(idSucursal),
      nombre_usuario: nombreUsuario.trim(),
      id_rol: Number(idRol),
    }

    if (contrasena) {
      body.contrasena = contrasena
    }

    saveMutation.mutate({
      id: selectedUser?.id_usuario,
      body,
    })
  }

  const totalUsers = usuarios.length
  const activeUsers = usuarios.filter((u) => u.activo).length
  const blockedUsers = usuarios.filter((u) => u.bloqueado).length

  const columns = [
    {
      key: 'nombre_completo',
      label: 'Empleado',
      render: (row: UsuarioDetalle) => (
        <div className="flex flex-col">
          <span className="font-bold text-on-surface font-headline">
            {row.primer_nombre} {row.primer_apellido}
          </span>
          <span className="text-xs text-outline">{row.correo ?? 'Sin correo'}</span>
        </div>
      ),
    },
    { key: 'nombre_usuario', label: 'Usuario' },
    {
      key: 'nombre_rol',
      label: 'Rol',
      render: (row: UsuarioDetalle) => (
        <span className="font-semibold text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-full">
          {row.nombre_rol}
        </span>
      ),
    },
    {
      key: 'nombre_sucursal',
      label: 'Sucursal',
      render: (row: UsuarioDetalle) => (
        <span className="text-xs text-on-surface-variant font-medium">
          {row.nombre_sucursal ?? 'No asignada'}
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: UsuarioDetalle) => {
        if (row.bloqueado) {
          return <Insignia variant="error">Bloqueado</Insignia>
        }
        return (
          <Insignia variant={row.activo ? 'exito' : 'neutro'}>
            {row.activo ? 'Activo' : 'Inactivo'}
          </Insignia>
        )
      },
    },
    {
      key: 'acciones',
      label: 'Acciones',
      className: 'text-right',
      render: (row: UsuarioDetalle) => (
        <div className="flex justify-end gap-1">
          {row.bloqueado && (
            <button
              onClick={() => unlockMutation.mutate(row.id_usuario)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-all animate-pulse"
              title="Desbloquear acceso"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
            </button>
          )}
          <button
            onClick={() => handleOpenModal(row)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title="Editar usuario"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => toggleEstadoMutation.mutate({ id: row.id_usuario, activo: !row.activo })}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              row.activo
                ? 'text-red-500 hover:bg-red-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.activo ? 'Desactivar usuario' : 'Activar usuario'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {row.activo ? 'toggle_on' : 'toggle_off'}
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
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Gestión de Usuarios</h1>
          <p className="text-sm text-outline mt-1">Administración de credenciales de acceso, roles y asignación de personal</p>
        </div>
        <Boton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">person_add</span>
          Nuevo Usuario
        </Boton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Total Usuarios</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{totalUsers}</h2>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Usuarios Activos</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{activeUsers}</h2>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider">Bloqueados</p>
              <h2 className="text-2xl font-black text-on-surface font-headline mt-0.5">{blockedUsers}</h2>
            </div>
          </div>
        </Tarjeta>
      </div>

      {/* Table Section */}
      <Tarjeta>
        {isLoadingUsers ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <CargadorIris size={48} />
            <p className="text-sm text-outline mt-4 font-semibold">Cargando usuarios…</p>
          </div>
        ) : (
          <Tabla
            columns={columns}
            data={usuarios}
            emptyMessage="No hay usuarios registrados en el sistema."
          />
        )}
      </Tarjeta>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        titulo={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        maxWith="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1" noValidate>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-wider mb-2">Datos del Empleado</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="user-primer-nombre"
              label="Primer Nombre"
              placeholder="Ej: Juan"
              value={primerNombre}
              onChange={(e) => setPrimerNombre(e.target.value)}
              error={formError.primer_nombre}
              disabled={saveMutation.isPending}
              required
            />
            <Campo
              id="user-segundo-nombre"
              label="Segundo Nombre"
              placeholder="Ej: Carlos (Opcional)"
              value={segundoNombre}
              onChange={(e) => setSegundoNombre(e.target.value)}
              error={formError.segundo_nombre}
              disabled={saveMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="user-primer-apellido"
              label="Primer Apellido"
              placeholder="Ej: Pérez"
              value={primerApellido}
              onChange={(e) => setPrimerApellido(e.target.value)}
              error={formError.primer_apellido}
              disabled={saveMutation.isPending}
              required
            />
            <Campo
              id="user-segundo-apellido"
              label="Segundo Apellido"
              placeholder="Ej: López (Opcional)"
              value={segundoApellido}
              onChange={(e) => setSegundoApellido(e.target.value)}
              error={formError.segundo_apellido}
              disabled={saveMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="user-telefono"
              label="Teléfono"
              placeholder="Ej: 8888-8888"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={formError.numero_telefono}
              icon="phone"
              disabled={saveMutation.isPending}
            />
            <Campo
              id="user-correo"
              label="Correo Electrónico"
              placeholder="Ej: juan.perez@drlentes.com"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              error={formError.correo}
              icon="mail"
              disabled={saveMutation.isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-sucursal" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Sucursal Asignada
            </label>
            <select
              id="user-sucursal"
              value={idSucursal}
              onChange={(e) => setIdSucursal(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              disabled={saveMutation.isPending}
            >
              <option value="">Selecciona una sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id_sucursal} value={s.id_sucursal}>
                  {s.nombre}
                </option>
              ))}
            </select>
            {formError.id_sucursal && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {formError.id_sucursal}
              </p>
            )}
          </div>

          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-wider mb-2 pt-4 border-t border-surface-container">
            Credenciales de Acceso
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              id="user-username"
              label="Nombre de Usuario"
              placeholder="Ej: jperez"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              error={formError.nombre_usuario}
              icon="person"
              disabled={saveMutation.isPending}
              required
            />

            <div className="relative flex flex-col gap-1.5">
              <label htmlFor="user-password" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {selectedUser ? 'Cambiar Contraseña (Opcional)' : 'Contraseña'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={selectedUser ? 'Dejar en blanco para mantener' : '••••••••'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className={`w-full bg-surface-container-low border border-transparent rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all
                    ${formError.contrasena 
                      ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' 
                      : 'focus:ring-2 focus:ring-primary/20 focus:border-primary/30'
                    }`}
                  disabled={saveMutation.isPending}
                  required={!selectedUser}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {formError.contrasena && (
                <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1 animate-fade-in">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formError.contrasena}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-rol" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Rol del Usuario
            </label>
            <select
              id="user-rol"
              value={idRol}
              onChange={(e) => setIdRol(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              disabled={saveMutation.isPending}
            >
              <option value="">Selecciona un rol</option>
              {roles.map((r) => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre_rol}
                </option>
              ))}
            </select>
            {formError.id_rol && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {formError.id_rol}
              </p>
            )}
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
              Guardar Usuario
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
