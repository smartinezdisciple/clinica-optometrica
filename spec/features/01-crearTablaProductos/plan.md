# Plan: Creación de la Tabla de Productos

## Fase 1 — Backend: módulo `inventario`

1. Crear `backend/src/modules/inventario/` con:
   - `inventario.types.ts` — interfaz `ProductoInventario` + schema Zod de respuesta
   - `inventario.repository.ts` — query SQL que junta `productos`, `inventario_sucursal`,
     `movimientos_inventario`, `usuarios` y `marcos_oftalmologicos`
   - `inventario.service.ts` — orquesta llamada al repository
   - `inventario.controller.ts` — handler `listarProductos`
   - `inventario.routes.ts` — router con autenticación
2. Registrar en `backend/src/app.ts`: `app.use('/api/inventario', inventarioRouter)`

## Fase 2 — Frontend: types y data fetching

1. Crear `frontend/src/features/inventario/types/index.ts` con interfaz `ProductoInventario`.
2. En `PaginaInventario.tsx`: `useQuery` para consumir `GET /api/inventario/productos`.

## Fase 3 — Frontend: tabla en PaginaInventario

- Reemplazar el stub actual con `<Tarjeta>` conteniendo `<Tabla>`.
- Columnas: `#`, Nombre, Categoría (Insignia), Cantidad, Ingresado por, Fecha, Precio, Marca.
- Loading: `<CargadorIris />`.

## Fase 4 — Verificación

1. `npm run dev` y navegar a `/inventario`.
2. Correr `npm run lint` y `npm run build`.
