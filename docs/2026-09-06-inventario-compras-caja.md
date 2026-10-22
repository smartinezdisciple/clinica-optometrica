# 2026-09-06 — Inventario (granel/serializado), Compras y Caja

## Contexto y causa raíz corregida

El usuario no veía el módulo de Auditoría implementado antes. La causa: abría un
servidor de otro proyecto en `:5173` cuyo proxy apuntaba a un backend viejo en
`:3000` sin `/api/auditoria`. Además **`frontend/vite.config.js`** (artefacto
compilado por `tsc`) tiene prioridad sobre `vite.config.ts` en Vite y estaba
hardcodeado a `:3000`.

**Arreglo:** ambos config files usan `target: process.env.VITE_BACKEND_PROXY ?? 'http://localhost:3000'` + `xfwd: true`.
Verificado end-to-end vía `:5173` (login + `GET /api/auditoria` → 200).

Entorno dev actual:
- Backend: `:3001` CLI `tsx watch src/app.ts` (log `/tmp/opencode/backend-dev.log`).
- Frontend: `:5173` Vite dev (log `/tmp/opencode/frontend-dev.log`).
- BD: Postgres local `:5432`, db `clinica_optometrica`, user `clinica_user`.

## BD (`basedatos.sql` aplicado en local)

- `productos.tipo_manejo VARCHAR(12) CHECK ('granel','serializado')` DEFAULT `'granel'`.
- Nueva tabla `unidades_serializadas` (numero_serie UNIQUE, estado
  disponible/reservado/vendido/descartado, id_producto, id_sucursal, id_detalle_compra).
- `detalles_venta.id_unidad_serializada` FK nullable.

## Backend (capas controller → service → repository, Zod, auditoría, transacciones)

- **Inventario ampliado** (`modules/inventario/`): catálogo con
  `cantidad_granel`/`cantidad_serializada`, tipo_manejo y labels; alta de producto
  con `stock_inicial` (granel) o `seriales` (serializado); `POST /productos/:id/seriales`;
  `POST /movimientos` (entrada/salida/ajuste/perdida) con validación de stock en tx.
- **Compras nuevo** (`modules/compras/`): proveedores (CRUD create/list),
  órdenes de compra (`POST /compras` con `recibida` para sumar inventario al
  instante), `POST /compras/:id/items`, `PATCH /compras/:id/estado`
  (finalizada → suma inventario en tx, valida superávit de seriales). Ítems por
  `id_producto` XOR `nuevoProducto`; serializado cuenta unidades por seriales.
- **Caja nuevo** (`modules/caja/`): cajas CRUD + activa, apertura única activa por
  caja, movimientos (ingreso/egreso/ajuste, exigen caja abierta), resumen
  (inicial + ingresos − egresos + ajustes → saldo esperado), cierre con diferencia
  (sobrante/faltante). Auditoría en altas/aperturas/movimientos/cierres.

Registrados en `app.ts`: `/api/inventario`, `/api/compras`, `/api/caja`, `/api/auditoria`.

## Frontend (React + Vite, TanStack Query, Zustand, alias `@/*`)

- **Inventario:** botón "Ingreso de inventario" → `ModalIngresoInventario` (tabs
  "Nuevo producto" con autogenerador de seriales / "Ingreso a existente"). Nueva
  columna "Manejo" en la tabla.
- **Compras:** `PaginaCompras` (tabla de órdenes + proveedores, ver detalle con
  seriales, botón "Recibir"), `ModalNuevaCompra` con ítems dinámicos
  (existente/nuevo, granel cantidad o seriales por línea).
- **Caja:** `PaginaCaja` (selector de caja, resumen, movimientos, modales de
  crear/abrir/movimiento/cierre). Ruta `/caja` y `/compras` en `router/index.tsx`.
- Sidebar: agregado ítem "Compras"; "Caja" ya existía.

## Verificación ejecutada

- `tsc --noEmit` backend y frontend → limpios.
- `vite build` frontend y `tsc` backend → OK.
- E2E por API real: alta producto serializado (2 unidades), compra `recibida=true`
  con ítem granel nuevo (5 u.) + serial nuevo (1 u.) → inventario reflejó
  granel 5 y serializado 3; `GET /productos/1/seriales` lista LP-2026-0001/2/3
  (se corrigió la columna `s.nombre_sucursal` → `s.nombre AS nombre_sucursal`).
  Flujo caja crear→abrir(500)→ingreso(100)→estado(saldo 600)→cierre(600=cuadrada).
- Tests unitarios: **3 fallos preexistentes** en `citas.service.test` (módulo sin
  tocar en esta sesión). Playwright no corre en este WSL (falta `libnspr4.so`,
  sin sudo) — solo suites de HTML legacy disponibles; no nuevos tests SPA.

## Pendiente / notas

- Modales de caja/compras/inventario funcionan contra API; conviene un smoke
  test Playwright del SPA una vez que el runner tenga librerías del sistema.
- Módulo Ventas POS aún sin integrar con Caja (apertura obliga caja abierta).
- `backend/dist/` reconstruido con `tsc`; CI: lint sin flags reales (deshabilitado
  hasta typescript-eslint compat con TS7).