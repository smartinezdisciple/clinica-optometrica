export type TipoProducto = 'marco_oftalmologico' | 'gafas_sol' | 'accesorio' | 'lente_comercial'
export type TipoManejo = 'granel' | 'serializado'

export interface ProductoInventario {
  id_producto:           number
  enumeracion:           string
  nombre_producto:       string
  tipo_producto:         TipoProducto
  tipo_producto_label:   string
  tipo_manejo:           TipoManejo
  tipo_manejo_label:     string
  precio_venta:          number
  cantidad:              number
  cantidad_granel:       number | null
  cantidad_serializada:  number | null
  ingresado_por:         string | null
  fecha_ingreso:         string | null
  marca:                 string | null
}

export interface UnidadSerializada {
  id_unidad:       number
  numero_serie:    string
  estado:          'disponible' | 'reservado' | 'vendido' | 'descartado'
  fecha_ingreso:   string | null
  fecha_venta:     string | null
  id_sucursal:     number | null
  nombre_sucursal: string | null
}