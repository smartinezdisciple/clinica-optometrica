# 01-crearTablaProductos — Resumen

## Qué se hizo

Se implementó la tabla de productos del inventario para la clínica optométrica,
mostrando productos de tipo marco oftalmológico, gafas de sol y accesorios.

## Archivos creados/modificados

### Planificación
- `01-crearTablaProductos/spec.md` — especificación de columnas y comportamiento
- `01-crearTablaProductos/plan.md` — plan de implementación por fases
- `01-crearTablaProductos/tasks.md` — checklist de tareas

### Backend (módulo inventario)
- `backend/src/modules/inventario/inventario.types.ts` — interfaces `ProductoInventarioDb`, `ProductoInventario` + schema Zod
- `backend/src/modules/inventario/inventario.repository.ts` — query SELECT con JOIN a inventario_sucursal, movimientos_inventario, usuarios, marcos_oftalmologicos; filtro por sucursal del usuario, tipos permitidos y activo
- `backend/src/modules/inventario/inventario.service.ts` — capa de negocio que añade `tipo_producto_label`
- `backend/src/modules/inventario/inventario.controller.ts` — handler `list` que responde con los productos
- `backend/src/modules/inventario/inventario.routes.ts` — router con `autenticar` middleware
- `backend/src/app.ts` — registro del router `inventarioRouter`

### Frontend
- `frontend/src/features/inventario/types/index.ts` — interfaz `ProductoInventario`
- `frontend/src/features/inventario/pages/PaginaInventario.tsx` — rewrite completo: useQuery, columnas con Insignia para categoría, formato moneda para precio, fecha localizada, y CargadorIris para loading

## Patrón seguido
controller → service → repository, idéntico a `pacientes/`.

## Verificación
- `npm run build`: exitoso (frontend tsc + vite build, backend tsc)
- `npm run lint`: temporalmente deshabilitado por compatibilidad TS7
