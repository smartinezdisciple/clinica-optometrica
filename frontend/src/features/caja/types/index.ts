export interface Caja {
  id_caja:     number
  nombre_caja: string
  id_sucursal: number
  activa:      boolean
}

export interface AperturaActiva {
  id_apertura:    number
  fecha_apertura: string
  monto_inicial:  number
  observaciones:  string | null
}

export interface ResumenCaja {
  aperturaActiva:  AperturaActiva | null
  montoInicial:    number
  totalIngresos:   number
  totalEgresos:    number
  totalAjustes:    number
  saldoEsperado:   number
}

export interface EstadoCaja {
  caja:    Caja
  resumen: ResumenCaja
}

export interface MovimientoCaja {
  id_movimiento:    number
  tipo_movimiento:  'ingreso' | 'egreso' | 'ajuste'
  monto:            number
  descripcion:      string | null
  fecha_movimiento: string
  id_usuario:       number
  nombre_usuario:   string | null
}

export interface ResultadoCierre {
  id_apertura:   number
  cierre:        { id_cierre: number; diferencia: number }
  montoEsperado: number
  diferencia:    number
}

export const TIPO_MOVIMIENTO_LABEL: Record<MovimientoCaja['tipo_movimiento'], string> = {
  ingreso: 'Ingreso',
  egreso:  'Egreso',
  ajuste:  'Ajuste',
}