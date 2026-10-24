import { useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/lib/api'
import type { Paciente, Empresa } from '../../pacientes/types'
import { SelectorBusqueda } from '@/components/ui/SelectorBusqueda'
import type { ClienteVenta } from '../types'

interface SelectorClienteProps {
  value:    ClienteVenta | null
  onChange: (cliente: ClienteVenta | null) => void
  error?:   string
}

/**
 * Selector de cliente para el POS. Combina pacientes (Persona) y empresas en
 * una única lista buscable por nombre o razón social.
 */
export function SelectorCliente({ value, onChange, error }: SelectorClienteProps) {
  const { data: pacientesResponse, isLoading: cargandoPacientes } = useQuery({
    queryKey: ['ventas-pacientes'],
    queryFn: () => api.get<ApiResponse<Paciente[]>>('/pacientes'),
  })

  const { data: empresasResponse, isLoading: cargandoEmpresas } = useQuery({
    queryKey: ['ventas-empresas'],
    queryFn: () => api.get<ApiResponse<Empresa[]>>('/empresas'),
  })

  const pacientes: ClienteVenta[] = (pacientesResponse?.data ?? []).map((p) => ({
    id_cliente: p.id_cliente,
    nombre:     `${p.nombres} ${p.apellidos}`.trim(),
    tipo:       'Persona',
  }))

  const empresas: ClienteVenta[] = (empresasResponse?.data ?? []).map((e) => ({
    id_cliente: e.id_cliente,
    nombre:     e.razon_social,
    tipo:       'Empresa',
  }))

  const opciones = [...pacientes, ...empresas]

  return (
    <SelectorBusqueda<ClienteVenta>
      label="Cliente"
      options={opciones}
      value={value}
      onChange={onChange}
      getLabel={(c) => `${c.nombre} · ${c.tipo}`}
      getKey={(c) => c.id_cliente}
      placeholder="Seleccionar cliente…"
      searchPlaceholder="Buscar por nombre o razón social…"
      emptyMessage="Sin clientes registrados"
      loading={cargandoPacientes || cargandoEmpresas}
      error={error}
    />
  )
}
