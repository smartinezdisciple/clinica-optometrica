export const PALETA = [
  '#00658d',
  '#00aeef',
  '#8d4f00',
  '#e11d48',
  '#059669',
  '#7c3aed',
  '#f59e0b',
  '#64748b',
]

export function formatearMoneda(valor: number): string {
  return `₡${valor.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatearNumero(valor: number): string {
  return valor.toLocaleString('es-CR')
}
