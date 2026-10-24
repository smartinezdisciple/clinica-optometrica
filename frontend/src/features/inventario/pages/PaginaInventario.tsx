import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/lib/api'
import type { ProductoInventario } from '../types'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { Boton } from '@/components/ui/Boton'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { ModalIngresoInventario } from '../components/ModalIngresoInventario'

const CATEGORIA_VARIANT: Record<string, 'primario' | 'exito' | 'advertencia' | 'error' | 'neutro'> = {
  marco_oftalmologico: 'primario',
  gafas_sol: 'exito',
  accesorio: 'advertencia',
  lente_comercial: 'error',
}

const MANEJO_VARIANT: Record<string, 'primario' | 'exito' | 'advertencia' | 'error' | 'neutro'> = {
  granel: 'exito',
  serializado: 'primario',
}

export default function PaginaInventario() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const { data: response, isLoading } = useQuery({
    queryKey: ['inventario-productos'],
    queryFn: () => api.get<ApiResponse<ProductoInventario[]>>('/inventario/productos'),
    refetchInterval: 15000,
  })

  const productos = response?.data ?? []

  const columns = [
    {
      key: 'enumeracion',
      label: '#',
      className: 'w-12',
    },
    {
      key: 'nombre_producto',
      label: 'Nombre',
      render: (row: ProductoInventario) => (
        <div className="flex flex-col">
          <span className="font-bold text-on-surface font-headline">
            {row.nombre_producto}
          </span>
          <span className="text-xs text-outline">
            ID: {row.id_producto}
          </span>
        </div>
      ),
    },
    {
      key: 'tipo_producto',
      label: 'Categoría',
      render: (row: ProductoInventario) => (
        <Insignia variant={CATEGORIA_VARIANT[row.tipo_producto] ?? 'neutro'}>
          {row.tipo_producto_label}
        </Insignia>
      ),
    },
    {
      key: 'tipo_manejo',
      label: 'Manejo',
      render: (row: ProductoInventario) => (
        <Insignia variant={MANEJO_VARIANT[row.tipo_manejo] ?? 'neutro'}>
          {row.tipo_manejo_label}
        </Insignia>
      ),
    },
    { key: 'cantidad', label: 'Cantidad' },
    {
      key: 'ingresado_por',
      label: 'Ingresado por',
      render: (row: ProductoInventario) => (
        <span>{row.ingresado_por ?? '—'}</span>
      ),
    },
    {
      key: 'fecha_ingreso',
      label: 'Fecha',
      render: (row: ProductoInventario) => (
        <span>
          {row.fecha_ingreso
            ? new Date(row.fecha_ingreso).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'precio_venta',
      label: 'Precio',
      className: 'text-right',
      render: (row: ProductoInventario) => (
        <span className="font-semibold text-on-surface font-mono">
          ${Number(row.precio_venta).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'marca',
      label: 'Marca',
      render: (row: ProductoInventario) => (
        <span>{row.marca ?? '—'}</span>
      ),
    },
  ]

  return (
    <div className="p-8 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Gestión de Inventario</h1>
          <p className="text-sm text-outline mt-1">
            Productos, stock y movimientos del inventario
          </p>
        </div>
        <Boton onClick={() => setModalAbierto(true)}>
          <span className="material-symbols-outlined text-[18px]">add_box</span>
          Ingreso de inventario
        </Boton>
      </div>

      <ModalIngresoInventario
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        productos={productos}
      />

      <Tarjeta titulo="Productos en inventario">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <CargadorIris size={48} />
            <p className="text-sm text-outline mt-4 font-semibold">Cargando productos…</p>
          </div>
        ) : (
          <Tabla
            columns={columns}
            data={productos}
            emptyMessage="No se encontraron productos en el inventario."
          />
        )}
      </Tarjeta>
    </div>
  )
}
