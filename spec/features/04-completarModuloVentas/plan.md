# Plan: Módulo de Ventas (POS)

## Fase 1 — Backend: módulo `ventas`

1. Crear `backend/src/modules/ventas/` con:
   - `ventas.types.ts` — DTOs (`CrearVentaDto`, `ItemVentaDto`, `PagoDto`) + schemas Zod + tipos de
     respuesta (`VentaList`, `VentaDetalle`, `MetodoPago`).
   - `ventas.repository.ts`:
     - `findVentas(filtros)` — listado con joins a `clientes`, conteo de ítems y total.
     - `findVentaById(id)` — cabecera + `detalles_venta` (join `productos`) + `pagos`.
     - `findMetodosPago()` — `metodos_pago WHERE activo = TRUE`.
     - `findProductosVendibles(sucursalId)` — productos activos con stock > 0 en la sucursal
       (reutilizar el patrón del `inventario.repository`).
     - `findSerialesDisponibles(productoId, sucursalId)`.
     - `createVentaInTx({ clienteId, empleadoId, descuento, items, pagos })` — transacción:
       1. `INSERT INTO ventas (...)` (estado `en_proceso`).
       2. `INSERT INTO pagos (...) RETURNING id_pago`; enlazar `ventas.id_pago`.
       3. `INSERT INTO detalles_venta (...)` (deja que los triggers calculen totales/inventario).
       4. Marcar `unidades_serializadas.estado = 'vendido'` + `fecha_venta`.
       5. `INSERT INTO movimientos_financieros` (ingreso, id_venta) si hay apertura de caja activa.
       6. `UPDATE ventas SET estado_venta = 'finalizada'`.
     - `updateEstadoVenta(id, estado)`.
     - `getResumenVentas(rango)` — KPIs (total vendido, nº de ventas).
   - `ventas.service.ts` — resuelve `id_empleado` desde el usuario (`usuarios.id_empleado`),
     valida stock/disponibilidad, orquesta transacción y traduce errores de BD (`23505`, `23514`).
   - `ventas.controller.ts` — handlers `listar`, `detalle`, `crear`, `registrarPago`, `cambiarEstado`,
     `listarMetodosPago`, `productosVendibles`, `resumen`.
   - `ventas.routes.ts` — router con `autenticar`.
2. Registrar en `backend/src/app.ts`: `app.use('/api/ventas', ventasRouter)` (reemplaza el `TODO`).

## Fase 2 — Frontend: types y data fetching

1. Crear `frontend/src/features/ventas/types/index.ts` con `Venta`, `VentaDetalle`, `ItemCarrito`,
   `MetodoPago`, `ProductoVendible`, `UnidadSerializada`.
2. Hooks `useQuery`/`useMutation` con TanStack Query para cada endpoint.

## Fase 3 — Frontend: componentes

1. `components/PanelPOS.tsx` — buscador, chips de categoría, grid de productos.
2. `components/Carrito.tsx` — ítems, cantidades, subtotal, descuento, nota, totales, botón cobrar.
3. `components/SelectorCliente.tsx` — búsqueda de cliente.
4. `components/SelectorSerial.tsx` — elección de unidad serializada.
5. `components/ModalPago.tsx` — métodos de pago, efectivo + cambio, pago mixto.
6. `components/Comprobante.tsx` — ticket e impresión.
7. `components/HistorialVentas.tsx` — tabla, filtros, KPIs, detalle, cancelar.

## Fase 4 — Frontend: página

- Reemplazar el stub `PaginaVentas.tsx` con pestañas "Punto de Venta" / "Historial"
  (estado local `tab`), integrando los componentes anteriores.

## Fase 5 — Verificación

1. `npm run dev` y recorrer flujo completo: agregar producto → cliente → descuento → cobrar →
   comprobante → verificar en historial y en inventario (stock descontado).
2. Verificar venta de producto serializado (unidad pasa a `vendido`).
3. Verificar que el cierre de caja refleje el ingreso.
4. `npm run lint`, `npm run build` y tests de la feature.
