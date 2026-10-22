# 2026-10-21 — Módulo de Reportes (backend + frontend)

## Objetivo

Implementar el módulo de Reportes para la clínica: análisis de ventas, compras,
citas e inventario con filtros por período y sucursal, gráficas y exportación a
CSV/PDF. Acceso restringido al rol **Administrador**. El Dashboard se mantiene
como stub (fuera de alcance).

## Dependencias agregadas

- Backend: `pdfkit` + `@types/pdfkit` (generación de PDF en memoria).
- Frontend: `recharts` (gráficas de barras, líneas y pastel).

## Backend (`backend/src/modules/reportes/`)

Capas controller → service → repository, registrado en `backend/src/app.ts` como
`app.use('/api/reportes', reportesRouter)`.

- **`reportes.types.ts`** — schemas Zod (`FiltrosReporteSchema`,
  `FiltrosInventarioSchema`, `ExportQuerySchema`) y tipos de respuesta.
- **`reportes.repository.ts`** — agregaciones SQL:
  - Ventas: resumen, serie diaria, por método de pago, por sucursal, top
    productos y por estado.
  - Compras: resumen, serie diaria, por proveedor y por estado.
  - Citas: resumen, por estado y serie diaria.
  - Inventario: resumen, stock bajo mínimo y unidades por sucursal.
- **`reportes.service.ts`** — normaliza filtros (mes actual por defecto),
  valida fechas y calcula ticket promedio / tasa de completadas.
- **`reportes.controller.ts`** — handlers JSON y exportación.
- **`reportes.export.ts`** — `generarCsv` y `generarPdf` a partir de una
  estructura común de documento.
- **`reportes.routes.ts`** — `autenticar` + `autorizar('Administrador')` para
  todas las rutas.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reportes/ventas` | KPIs, serie, métodos de pago, sucursal, top productos, estados |
| GET | `/api/reportes/compras` | KPIs, serie, proveedores y estados |
| GET | `/api/reportes/citas` | KPIs, estados y serie diaria |
| GET | `/api/reportes/inventario` | KPIs, stock bajo y unidades por sucursal |
| GET | `/api/reportes/export` | `?tipo=&formato=csv\|pdf&desde=&hasta=&id_sucursal=` |

Filtros comunes: `desde`, `hasta` (`YYYY-MM-DD`) e `id_sucursal` (opcional).

### Decisiones clave

- `ventas`, `compras` y `citas` **no tienen `id_sucursal`**; la sucursal se
  deriva mediante `JOIN empleados` (`empleados.id_sucursal`).
- Solo se suman ventas/compras en estado `finalizada`; los montos usan
  `::float8` y los conteos `::int` para respetar los tipos del frontend.
- Inventario: CTE `stock` con `CROSS JOIN sucursales`; los productos
  serializados cuentan `unidades_serializadas.estado = 'disponible'` (incluye
  unidades sin sucursal asignada) y los granel usan `inventario_sucursal`.
- CSV: BOM UTF-8 (`\uFEFF`), escape de comas/comillas/saltos y protección
  contra inyección de fórmulas (`=`, `+`, `-`, `@` se prefijan con `'`).
- PDF: `pdfkit` con Helvetica, tablas con salto de página y `Content-Disposition`
  `reporte-<tipo>-<desde>_<hasta>.<ext>`.

## Frontend (`frontend/src/features/reportes/`)

- **`types/index.ts`** — tipos de reportes, `ETIQUETAS_ESTADO` y `PRESETS`.
- **`lib/fechas.ts`** — `fechaISO`, `rangoPreset` (hoy/7d/30d/mes) y
  `construirQuery`.
- **`api/reportes.api.ts`** — llamadas a los cuatro reportes y
  `descargarReporte` (CSV/PDF).
- **`hooks/useReportes.ts`** — hooks de TanStack Query con `enabled` por pestaña.
- **`components/`**:
  - `BarraFiltros` — presets, fechas y selector de sucursal.
  - `BotonExportar` — descarga CSV/PDF con feedback `sonner`.
  - `TarjetasKPI`, `GraficaBarras`, `GraficaLinea`, `GraficaPastel`.
  - `ReporteVentasPanel`, `ReporteComprasPanel`, `ReporteCitasPanel`,
    `ReporteInventarioPanel`, `EstadoReporte`.
- **`pages/PaginaReportes.tsx`** — pestañas Ventas/Compras/Citas/Inventario,
  filtros compartidos y exportación del reporte activo.
- **`lib/api.ts`** — nuevo helper `descargar()` para blobs autenticados con
  renovación de token y lectura de `Content-Disposition`.

### Navegación y seguridad

- Ruta lazy `/reportes` en `router/index.tsx`.
- Guard `RutaAdmin` (redirige a `/dashboard` si el rol no es Administrador).
- Enlace **Reportes** movido al bloque de Administrador de `BarraLateral`.

## Verificación ejecutada

- `npm run build --workspace=backend` → OK.
- `npm run build --workspace=frontend` (`tsc --noEmit` + `vite build`) → OK.
  Chunk `PaginaReportes-*.js` (~422 KB, incluye Recharts).
- `backend`: `npx vitest run` → **69 pasan, 3 fallos preexistentes** en
  `tests/unit/citas.service.test.ts` (fechas fijas en el pasado).
- `frontend`: `npx vitest run` → **14/14 pasan** (incluye 7 nuevos tests de
  `lib/fechas.test.ts`).
- Docker: `docker compose build backend frontend` + `up -d` → contenedores
  recreados correctamente; el bundle `PaginaReportes-*.js` se sirve por nginx.
- E2E API en Docker:
  - Login Administrador OK.
  - `/ventas`: 1 venta finalizada, ₡82.800; `/inventario`: 6 productos,
    1 con stock bajo. Compras y citas sin datos en el período.
  - Exportaciones de los 4 tipos en CSV (firma BOM `EFBBBF`) y PDF
    (firma `%PDF-`) con HTTP 200.
  - Filtro `id_sucursal=1` OK; fechas inválidas/rango invertido → 400;
    `tipo` inválido → 400.
  - Token sin rol Administrador → **403**; sin token o token inválido → **401**.
- E2E navegador (Playwright/Chromium): login, `/reportes` renderiza 3 gráficas
  en Ventas, pestaña Compras y descarga CSV (`reporte-compras-....csv`, 304 B).

## Pendientes / notas

- El Dashboard sigue siendo un stub; no se tocó en este cambio.
- Recharts incrementa el peso del chunk de Reportes (~422 KB); se mantiene
  lazy-loaded.
- No se modificó `basedatos.sql` (el módulo solo lee datos existentes).
- Los 3 fallos de citas son preexistentes y ajenos a Reportes.
