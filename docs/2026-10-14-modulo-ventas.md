# 2026-10-14 — Módulo de Ventas (POS): backend + frontend

## Objetivo

Completar el módulo de Ventas (punto de venta) de la clínica: registro de ventas
con pago único, control de inventario granel/serializado y reversión al cancelar,
más historial con KPIs. Incluye actualización del roadmap y una feature spec.

## Spec / documentación de feature

- `spec/constitution/roadmap.md` actualizado al estado real (inventario, compras,
  caja y auditoría ya implementados; ventas/lentes/expedientes/reportes/config
  pendientes).
- `spec/features/04-completarModuloVentas/` con `spec.md`, `plan.md`, `tasks.md`.
  Se documentó que el pago único (`ventas.id_pago`) deja el pago mixto fuera de
  alcance.

## Backend (`backend/src/modules/ventas/`, capas controller → service → repository)

- **`ventas.types.ts`** — DTOs Zod (`CrearVentaSchema`, `ItemVentaSchema`,
  `CambiarEstadoVentaSchema`, `ListarVentasQuerySchema`) + tipos de respuesta.
- **`ventas.repository.ts`** — catálogos (`metodos-pago`, `productos-disponibles`,
  `seriales-disponibles`), `findVentas`/`findVentaById`, `createVentaInTx`
  (transacción: venta + detalles + pago + movimiento financiero), `findCajaAbierta`,
  `updateEstadoVenta` con reversión de inventario, `getResumenVentas`.
- **`ventas.service.ts`** — `resolveEmpleadoId` (desde `usuarios.id_empleado`),
  `crearVenta`, `resolverItems` (valida stock granel / unidad serializada),
  `traducirErrorVenta` (23505/23514/P0001).
- **`ventas.controller.ts`** — handlers + auditoría (`registrarDesdeRequest`).
- **`ventas.routes.ts`** — rutas autenticadas (rutas específicas antes de `/:id`).
- Registrado en `backend/src/app.ts`: `app.use('/api/ventas', ventasRouter)`.

Endpoints: `GET /api/ventas`, `GET /api/ventas/:id`, `POST /api/ventas`,
`PATCH /api/ventas/:id/estado`, `GET /api/ventas/metodos-pago`,
`GET /api/ventas/productos-disponibles`,
`GET /api/ventas/seriales-disponibles?productoId=`, `GET /api/ventas/resumen`.

Decisiones clave (la BD hace el trabajo pesado, la app no lo duplica):
- Triggers `tg_restar_inventario_venta` y `tg_calcular_totales_venta`.
- Líneas serializadas se envían con `id_producto = NULL` + `id_unidad_serializada`
  para evitar el control de stock por cantidad; la unidad pasa a `vendido`.
- Cancelación revierte inventario (granel → `inventario_sucursal` + movimiento
  `entrada`; serializadas → `disponible`).
- La nota se guarda en `pagos.notas` (no existe columna en `ventas`).
- Caja abierta es opcional: si existe, inserta `movimientos_financieros`.
- `ventas.id_pago` = un único pago por venta.

## Frontend (`frontend/src/features/ventas/`, React + TanStack Query + `@/` aliases)

- **`types/index.ts`** — `Venta`, `VentaDetalle`, `ItemCarrito`, `MetodoPago`,
  `ProductoVendible`, `UnidadSerializada`, `ResumenVentas`, `ReciboData` + mapas de
  presentación (`ESTADO_VENTA_VARIANT`, `ESTADO_VENTA_LABEL`).
- **`components/SelectorCliente.tsx`** — combina `/pacientes` + `/empresas` en una
  lista buscable reutilizando `SelectorBusqueda`.
- **`components/SelectorSerial.tsx`** — modal para elegir una unidad serializada
  disponible (deshabilita las ya agregadas al carrito).
- **`components/PanelPOS.tsx`** — buscador + chips por categoría + grilla de
  tarjetas; deshabilita productos granel sin stock.
- **`components/Carrito.tsx`** — cliente, líneas (granel con ±cantidad, serializado
  x1), descuento %, nota, totales y botón cobrar.
- **`components/ModalPago.tsx`** — métodos de pago; para efectivo calcula el vuelto
  y exige monto recibido ≥ total.
- **`components/Comprobante.tsx`** — resumen post-venta con impresión en ventana
  aislada (`window.open` + `print`).
- **`components/HistorialVentas.tsx`** — filtros (estado/búsqueda/fechas), KPIs
  (`/ventas/resumen`), tabla, detalle y cancelación con reversión.
- **`pages/PaginaVentas.tsx`** — pestañas "Punto de venta" / "Historial"; maneja el
  carrito, totales y la mutación `POST /ventas`.

La ruta `/ventas` ya estaba registrada (lazy) en `router/index.tsx`.

## Verificación ejecutada

- `frontend`: `tsc --noEmit` limpio y `npm run build` OK
  (`PaginaVentas-*.js` ~32 KB).
- `frontend`: `vitest run` → 7/7 pasan.
- `backend`: `npx tsc --noEmit` y `npm run build` OK (verificado al cerrar el
  backend).
- `backend`: `npm run test:unit` → **60 pasan, 3 fallos preexistentes** en
  `tests/unit/citas.service.test.ts` (usan fechas pasadas fijas → "No se pueden
  programar citas en el pasado"); no relacionados con ventas.
- `npm run lint` (raíz): deshabilitado por config (`typescript-eslint` aún no
  compatible con TS7), no aplica.

## Pendiente / notas

- Pago mixto (varios métodos por venta) fuera de alcance por el modelo
  `ventas.id_pago` de una sola fila.
- Conviene un smoke test Playwright del flujo POS cuando el runner tenga las
  librerías del sistema.
- `interfaces/ventas.html` (UI legacy POS) queda como referencia pendiente de
  retirar.
