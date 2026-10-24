# Tasks — Módulo de Ventas (POS)

## Backend

- [x] Crear carpeta `backend/src/modules/ventas/`
- [x] `ventas.types.ts` — DTOs + schemas Zod + tipos de respuesta
- [x] `ventas.repository.ts` — `findVentas`, `findVentaById`, `findMetodosPago`,
      `findProductosVendibles`, `findSerialesDisponibles`, `createVentaInTx`,
      `updateEstadoVenta` (con reversión), `getResumenVentas`
- [x] `ventas.service.ts` — resolución de `id_empleado`, validaciones y transacción
- [x] `ventas.controller.ts` — handlers de todos los endpoints
- [x] `ventas.routes.ts` — router con `autenticar`
- [x] Registrar `app.use('/api/ventas', ventasRouter)` en `backend/src/app.ts`
- [x] Endpoints:
      - [x] `GET /api/ventas` (filtros: estado, búsqueda, rango fecha)
      - [x] `GET /api/ventas/:id`
      - [x] `POST /api/ventas` (crea y cobra en un solo paso)
      - [x] `PATCH /api/ventas/:id/estado` (finalizar/cancelar con reversión de inventario)
      - [x] `GET /api/ventas/metodos-pago`
      - [x] `GET /api/ventas/productos-disponibles`
      - [x] `GET /api/ventas/seriales-disponibles`
      - [x] `GET /api/ventas/resumen`
      - [~] `POST /api/ventas/:id/pagos` — omitido: `POST /api/ventas` ya registra el pago
        (el esquema admite un solo `pago` por venta)
- [x] `npx tsc --noEmit` — typecheck OK
- [x] `npm run build` — build OK
- [ ] Verificar endpoints con `curl`/Postman (requiere BD en ejecución)

## Frontend — Types

- [x] Crear `frontend/src/features/ventas/types/index.ts`
- [x] Definir `Venta`, `VentaDetalle`, `ItemCarrito`, `MetodoPago`, `ProductoVendible`, `UnidadSerializada`
      (más `ResumenVentas`, `ReciboData` y mapas de presentación)

## Frontend — Componentes

- [x] `components/PanelPOS.tsx` — buscador + chips de categoría + grid de productos
- [x] `components/Carrito.tsx` — ítems, cantidades, descuento, nota, totales
- [x] `components/SelectorCliente.tsx` — búsqueda de cliente (Persona / Empresa)
- [x] `components/SelectorSerial.tsx` — selección de unidad serializada
- [x] `components/ModalPago.tsx` — métodos de pago, efectivo + cambio
      (pago mixto omitido: un solo pago por venta)
- [x] `components/Comprobante.tsx` — ticket e impresión
- [x] `components/HistorialVentas.tsx` — tabla, filtros, KPIs, detalle, cancelar

## Frontend — Página

- [x] Reemplazar el stub `PaginaVentas.tsx` con pestañas POS / Historial
- [x] Integrar carrito, cliente, descuento y cálculo de totales
- [x] Integrar modal de pago y comprobante
- [x] Verificar navegación a `/ventas` (ruta ya registrada, lazy)

## Validación

- [x] `npx tsc --noEmit` (frontend) — typecheck OK
- [x] `npm run build` (frontend) — build exitoso
- [x] `vitest run` (frontend) — 7/7 pasan
- [x] `npm run test:unit` (backend) — 60 pasan, 3 fallos preexistentes en citas
- [x] Guardar resumen en `/docs` tras verificar
- [ ] Flujo completo E2E por API real: producto → cliente → cobrar → comprobante → historial
- [ ] Stock descontado en inventario tras la venta (vía trigger)
- [ ] Venta de producto serializado marca la unidad como `vendido`
- [ ] Movimiento financiero reflejado en caja abierta
