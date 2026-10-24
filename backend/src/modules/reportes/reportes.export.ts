import PDFDocument from 'pdfkit'
import type {
  DocumentoExport,
  FiltrosReporte,
  GrupoCantidad,
  GrupoMonto,
  ReporteCitas,
  ReporteCompras,
  ReporteInventario,
  ReporteVentas,
  SeccionExport,
  TipoReporte,
} from './reportes.types'

// ─── Etiquetas legibles ────────────────────────────────────────────────────────
const ETIQUETAS_ESTADO: Record<string, string> = {
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  confirmada: 'Confirmada',
  reprogramada: 'Reprogramada',
  en_espera_confirmacion: 'En espera de confirmación',
  completada: 'Completada',
}

function etiqueta(valor: string): string {
  return ETIQUETAS_ESTADO[valor] ?? valor
}

function dinero(valor: number): string {
  return valor.toFixed(2)
}

function filasGrupoMonto(grupos: GrupoMonto[]): Array<Array<string | number>> {
  return grupos.map((g) => [g.etiqueta, g.cantidad, dinero(g.total)])
}

function filasGrupoCantidad(grupos: GrupoCantidad[]): Array<Array<string | number>> {
  return grupos.map((g) => [etiqueta(g.etiqueta), g.cantidad])
}

// ─── Construcción del documento por tipo ──────────────────────────────────────
function seccionesVentas(r: ReporteVentas): SeccionExport[] {
  return [
    {
      titulo: 'Resumen',
      columnas: ['Métrica', 'Valor'],
      filas: [
        ['Total vendido', dinero(r.resumen.totalVendido)],
        ['Número de ventas', r.resumen.numeroVentas],
        ['Ticket promedio', dinero(r.resumen.ticketPromedio)],
        ['Descuentos aplicados', dinero(r.resumen.totalDescuentos)],
        ['Subtotal', dinero(r.resumen.subtotal)],
      ],
    },
    {
      titulo: 'Ventas por día',
      columnas: ['Fecha', 'Ventas', 'Total'],
      filas: r.serie.map((p) => [p.fecha, p.cantidad, dinero(p.total)]),
    },
    {
      titulo: 'Ventas por método de pago',
      columnas: ['Método', 'Ventas', 'Total'],
      filas: filasGrupoMonto(r.porMetodoPago),
    },
    {
      titulo: 'Ventas por sucursal',
      columnas: ['Sucursal', 'Ventas', 'Total'],
      filas: filasGrupoMonto(r.porSucursal),
    },
    {
      titulo: 'Productos más vendidos',
      columnas: ['Producto', 'Cantidad', 'Total'],
      filas: r.topProductos.map((p) => [p.nombre, p.cantidad, dinero(p.total)]),
    },
    {
      titulo: 'Ventas por estado',
      columnas: ['Estado', 'Ventas', 'Total'],
      filas: r.porEstado.map((g) => [etiqueta(g.etiqueta), g.cantidad, dinero(g.total)]),
    },
  ]
}

function seccionesCompras(r: ReporteCompras): SeccionExport[] {
  return [
    {
      titulo: 'Resumen',
      columnas: ['Métrica', 'Valor'],
      filas: [
        ['Total comprado', dinero(r.resumen.totalComprado)],
        ['Número de compras', r.resumen.numeroCompras],
        ['Ticket promedio', dinero(r.resumen.ticketPromedio)],
      ],
    },
    {
      titulo: 'Compras por día',
      columnas: ['Fecha', 'Compras', 'Total'],
      filas: r.serie.map((p) => [p.fecha, p.cantidad, dinero(p.total)]),
    },
    {
      titulo: 'Compras por proveedor',
      columnas: ['Proveedor', 'Compras', 'Total'],
      filas: filasGrupoMonto(r.porProveedor),
    },
    {
      titulo: 'Compras por estado',
      columnas: ['Estado', 'Compras', 'Total'],
      filas: r.porEstado.map((g) => [etiqueta(g.etiqueta), g.cantidad, dinero(g.total)]),
    },
  ]
}

function seccionesCitas(r: ReporteCitas): SeccionExport[] {
  return [
    {
      titulo: 'Resumen',
      columnas: ['Métrica', 'Valor'],
      filas: [
        ['Total de citas', r.resumen.total],
        ['Completadas', r.resumen.completadas],
        ['Canceladas', r.resumen.canceladas],
        ['Tasa de completadas (%)', dinero(r.resumen.tasaCompletadas)],
      ],
    },
    {
      titulo: 'Citas por estado',
      columnas: ['Estado', 'Cantidad'],
      filas: filasGrupoCantidad(r.porEstado),
    },
    {
      titulo: 'Citas por día',
      columnas: ['Fecha', 'Cantidad'],
      filas: r.serie.map((p) => [p.fecha, p.cantidad]),
    },
  ]
}

function seccionesInventario(r: ReporteInventario): SeccionExport[] {
  return [
    {
      titulo: 'Resumen',
      columnas: ['Métrica', 'Valor'],
      filas: [
        ['Productos activos', r.resumen.totalProductos],
        ['Agotados', r.resumen.agotados],
        ['Registros con stock bajo', r.resumen.stockBajo],
        ['Valorización a precio de venta', dinero(r.resumen.valorizacionVenta)],
      ],
    },
    {
      titulo: 'Stock bajo mínimo',
      columnas: ['Producto', 'Sucursal', 'Cantidad', 'Mínimo', 'Faltante'],
      filas: r.stockBajo.map((s) => [
        s.nombre_producto,
        s.sucursal,
        s.cantidad,
        s.stock_minimo,
        s.faltante,
      ]),
    },
    {
      titulo: 'Unidades por sucursal',
      columnas: ['Sucursal', 'Unidades'],
      filas: filasGrupoCantidad(r.porSucursal),
    },
  ]
}

const TITULOS: Record<TipoReporte, string> = {
  ventas: 'Reporte de ventas',
  compras: 'Reporte de compras',
  citas: 'Reporte de citas',
  inventario: 'Reporte de inventario',
}

/**
 * Convierte el resultado de un reporte en un documento exportable (secciones
 * tabulares reutilizadas por CSV y PDF).
 */
export function construirDocumento(
  tipo: TipoReporte,
  data: ReporteVentas | ReporteCompras | ReporteCitas | ReporteInventario,
  filtros: FiltrosReporte
): DocumentoExport {
  let secciones: SeccionExport[]

  switch (tipo) {
    case 'ventas':     secciones = seccionesVentas(data as ReporteVentas); break
    case 'compras':    secciones = seccionesCompras(data as ReporteCompras); break
    case 'citas':      secciones = seccionesCitas(data as ReporteCitas); break
    case 'inventario': secciones = seccionesInventario(data as ReporteInventario); break
  }

  const sucursal = filtros.id_sucursal
    ? `Sucursal #${filtros.id_sucursal}`
    : 'Todas las sucursales'

  return {
    titulo: TITULOS[tipo],
    subtitulo: `Del ${filtros.desde} al ${filtros.hasta} · ${sucursal}`,
    secciones,
  }
}

// ─── CSV ───────────────────────────────────────────────────────────────────────
function celda(valor: string | number): string {
  let s = String(valor ?? '')
  // Evita inyección de fórmulas al abrir el CSV en una hoja de cálculo.
  if (typeof valor === 'string' && /^[=+\-@]/.test(valor)) s = `'${s}`
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

function fila(valores: Array<string | number>): string {
  return valores.map(celda).join(',')
}

export function generarCsv(doc: DocumentoExport): string {
  const lineas: string[] = [fila([doc.titulo]), fila([doc.subtitulo]), '']

  for (const seccion of doc.secciones) {
    lineas.push(fila([seccion.titulo]))
    lineas.push(fila(seccion.columnas))
    for (const f of seccion.filas) lineas.push(fila(f))
    lineas.push('')
  }

  // BOM para que Excel reconozca UTF-8.
  return `\uFEFF${lineas.join('\r\n')}`
}

// ─── PDF ───────────────────────────────────────────────────────────────────────
type PdfDocumento = PDFKit.PDFDocument

function dibujarFila(
  pdf: PdfDocumento,
  celdas: Array<string | number>,
  anchoColumna: number,
  izquierda: number,
  encabezado: boolean
): void {
  const margenInferior = pdf.page.height - pdf.page.margins.bottom

  pdf.font(encabezado ? 'Helvetica-Bold' : 'Helvetica').fontSize(9)
  const textos = celdas.map((c) => String(c ?? ''))
  const alturas = textos.map((t) => pdf.heightOfString(t, { width: Math.max(anchoColumna - 8, 20) }))
  const altura = Math.max(...alturas, 12) + 6

  if (pdf.y + altura > margenInferior) {
    pdf.addPage()
  }

  const y = pdf.y

  if (encabezado) {
    pdf.save()
    pdf.rect(izquierda, y, anchoColumna * celdas.length, altura).fill('#f2f4f6')
    pdf.restore()
  }

  textos.forEach((texto, i) => {
    pdf.fillColor('#191c1e').text(texto, izquierda + i * anchoColumna + 4, y + 3, {
      width: Math.max(anchoColumna - 8, 20),
      lineBreak: true,
    })
  })

  pdf.y = y + altura
}

function dibujarSeccion(pdf: PdfDocumento, seccion: SeccionExport): void {
  const margenInferior = pdf.page.height - pdf.page.margins.bottom
  if (pdf.y > margenInferior - 70) pdf.addPage()

  pdf.font('Helvetica-Bold').fontSize(12).fillColor('#191c1e').text(seccion.titulo)
  pdf.moveDown(0.35)

  const izquierda = pdf.page.margins.left
  const ancho = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right
  const anchoColumna = ancho / Math.max(seccion.columnas.length, 1)

  dibujarFila(pdf, seccion.columnas, anchoColumna, izquierda, true)
  for (const f of seccion.filas) {
    dibujarFila(pdf, f, anchoColumna, izquierda, false)
  }

  pdf.moveDown(0.8)
}

export function generarPdf(doc: DocumentoExport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new PDFDocument({ size: 'A4', margin: 40 })
      const chunks: Buffer[] = []

      pdf.on('data', (chunk: Buffer) => chunks.push(chunk))
      pdf.on('end', () => resolve(Buffer.concat(chunks)))
      pdf.on('error', reject)

      pdf.font('Helvetica-Bold').fontSize(18).fillColor('#00658d').text(doc.titulo)
      pdf.moveDown(0.2)
      pdf.font('Helvetica').fontSize(10).fillColor('#41484d').text(doc.subtitulo)
      pdf.moveDown(0.8)

      for (const seccion of doc.secciones) {
        dibujarSeccion(pdf, seccion)
      }

      pdf.end()
    } catch (err) {
      reject(err)
    }
  })
}
