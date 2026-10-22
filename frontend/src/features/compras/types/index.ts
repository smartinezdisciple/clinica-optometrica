export interface Proveedor {
  id_proveedor:    number
  nombre_empresa:  string
  nombre_contacto: string | null
  telefono:        string | null
  correo:          string | null
  direccion:       string | null
  ruc:             string | null
  activo:          boolean
}

export interface DetalleCompra {
  id_detalle_compra: number
  cantidad:          number
  precio_unitario:   number
  subtotal:          number
  id_producto:       number
  nombre_producto:   string
  tipo_manejo:       string
  seriales:          string[] | null
  unidadesCreadas:   number
}

export interface Compra {
  id_compra:      number
  fecha_compra:   string
  estado_compra:  'en_proceso' | 'finalizada' | 'cancelada'
  total_compra:   number
  observaciones:  string | null
  id_proveedor:   number
  nombre_empresa: string
  numero_items:   number
}

export interface CompraDetalle extends Compra {
  items: DetalleCompra[]
}

export interface ItemCompra {
  id_producto?:   number
  nuevoProducto?: {
    nombre_producto: string
    codigo_producto: string | null
    tipo_producto:   string
    tipo_manejo:     'granel' | 'serializado'
    precio_venta:    number
    precio_compra:   number | null
    marca:           string | null
  }
  cantidad?:       number
  seriales?:       string[]
  precio_unitario: number
}