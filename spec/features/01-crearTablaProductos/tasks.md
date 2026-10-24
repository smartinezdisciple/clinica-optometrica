# Tasks — Tabla de Productos

## Backend

- [x] Crear carpeta `backend/src/modules/inventario/`
- [x] Crear `inventario.types.ts` con interfaz y schema Zod
- [x] Crear `inventario.repository.ts` con la query SQL
- [x] Crear `inventario.service.ts`
- [x] Crear `inventario.controller.ts` con handler `listarProductos`
- [x] Crear `inventario.routes.ts` con ruta protegida
- [x] Registrar router en `backend/src/app.ts`
- [x] Verificar endpoint con `curl` o Postman

## Frontend — Types

- [x] Crear `frontend/src/features/inventario/types/index.ts`
- [x] Definir interfaz `ProductoInventario`

## Frontend — PaginaInventario

- [x] Agregar `useQuery` para `GET /api/inventario/productos`
- [x] Definir columnas de la tabla según spec
- [x] Renderizar `<Tarjeta>` conteniendo `<Tabla>` con los datos
- [x] Reemplazar el stub de `PaginaInventario.tsx`
- [x] Verificar navegación a `/inventario`

## Validación

- [x] `npm run dev` — sin errores
- [ ] `npm run lint` — sin warnings (temporalmente deshabilitado por compatibilidad TS7)
- [x] `npm run build` — build exitoso
