import { describe, expect, it } from 'vitest'
import { generarCsv, generarPdf } from '../../src/modules/reportes/reportes.export'
import type { DocumentoExport } from '../../src/modules/reportes/reportes.types'

const DOCUMENTO: DocumentoExport = {
  titulo: 'Reporte de prueba',
  subtitulo: 'Del 2026-10-01 al 2026-10-21',
  secciones: [
    {
      titulo: 'Detalle',
      columnas: ['Producto', 'Total'],
      filas: [
        ['Estuche, negro', 6300],
        ['Comilla "doble"', 10],
        ['=SUMA(A1:A2)', 5],
      ],
    },
  ],
}

describe('reportes.export — CSV', () => {
  it('incluye BOM y escapa comas, comillas y fórmulas', () => {
    const csv = generarCsv(DOCUMENTO)

    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain('"Estuche, negro"')
    expect(csv).toContain('"Comilla ""doble"""')
    expect(csv).toContain("'=SUMA(A1:A2)")
    expect(csv).toContain('Producto,Total')
  })
})

describe('reportes.export — PDF', () => {
  it('genera un buffer PDF válido', async () => {
    const pdf = await generarPdf(DOCUMENTO)

    expect(Buffer.isBuffer(pdf)).toBe(true)
    expect(pdf.length).toBeGreaterThan(500)
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })
})
