# Módulo de Auditoría (`logs_sistema`)

_Fecha: 2026-09-06_

## Contexto

La tabla `logs_sistema` ya existía en la base de datos Neon (5 registros históricos). Se amplió para soportar auditoría de negocio y se construyó el módulo completo backend + frontend.

## Cambios en la base de datos

Aplicados en vivo en Neon con `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` y sincronizados en `basedatos.sql`:

| Columna nueva | Tipo | Uso |
|---|---|---|
| `tipo_evento` | `VARCHAR(20)` | CREATE / UPDATE / DELETE / LOGIN / LOGIN_FAILED / LOGOUT / EXPORT / CONFIG |
| `id_sucursal` | `INTEGER REFERENCES sucursales(id_sucursal)` | Auditar por sucursal |
| `tabla_afectada` | `VARCHAR(50)` | Entidad afectada |
| `id_entidad` | `INTEGER` | PK de la entidad afectada |
| `detalle` | `JSONB` | Contexto estructurado |
| `antes` / `despues` | `JSONB` | Snapshots antes/después del cambio |

Índices nuevos: `idx_logs_tipo_evento`, `idx_logs_sucursal`, `idx_logs_tabla_entidad`.

## Backend — `backend/src/modules/auditoria/`

- `auditoria.types.ts` — zod + interfaces (`TipoEvento`, `RegistrarLogInput`, `ListarLogsQuery`, `LogDb`).
- `auditoria.repository.ts` — `insertLog`, `findLogById`, `findLogs` (filtros + paginación), `findModulosRegistrados`.
- `auditoria.service.ts` — `registrar()` (no lanza errores, loguea por consola para no romper la operación), `getLog`, `listLogs`, `getModulosDisponibles`.
- `auditoria.context.ts` — `registrarDesdeRequest(req, input)` extrae automáticamente `id_usuario`, `id_sucursal` (del JWT) e `ip_origen`.
- `auditoria.controller.ts` + `auditoria.routes.ts` — `GET /api/auditoria`, `GET /api/auditoria/:id`, `GET /api/auditoria/modulos`. Todo protegido con `autenticar` + `autorizar('Administrador')`.

Si un registro de auditoría falla, `registrar()` lo captura y solo registra en consola — nunca bloquea la operación de negocio.

## Integración en módulos (técnica: invocación explícita en eventos de negocio)

Añadido `registrarDesdeRequest` en los controladores de operaciones críticas:

- **Autenticación:** login exitoso (`LOGIN`), login fallido (`LOGIN_FAILED` con email e User-Agent), logout (`LOGOUT`).
- **Usuarios:** crear (`CREATE`), actualizar (`UPDATE`), habilitar/inhabilitar, desbloquear, permisos de rol (`CONFIG`).
- **Citas:** crear/actualizar cita, cambio de estado, crear/actualizar/eliminar horario.
- **Pacientes y Empresas:** crear/actualizar/eliminar.
- **Sucursales:** crear/actualizar, activar/desactivar.

## Frontend — `frontend/src/features/auditoria/`

- `types/index.ts` — tipos + constantes `TIPOS_EVENTO`.
- `pages/PaginaAuditoria.tsx` — tabla de logs con filtros (búsqueda, tipo de evento, módulo, rango de fechas) y paginación.
- Ruta `/auditoria` lazy-loaded en `router/index.tsx`, enlace "Auditoría" en `BarraLateral.tsx` (solo rol Administrador).

## Verificación

- `tsc --noEmit` backend ✓, frontend ✓
- `vite build` ✓, `tsc` backend (build) ✓
- Lint: placeholder (deshabilitado por compatibilidad typescript-eslint)
- Prueba de humo en Neon: INSERT con columnas nuevas (JSONB) funcionó, luego se limpió.

### Tests pendientes / conocidos
- `citas.service.test.ts`: 3 tests fallan por fechas hardcodeadas (`2026-07-20`) que ya son pasadas → "No se pueden programar citas en el pasado". **Pre-existente**, no relacionado con auditoría. Corregir fechas a futuro si se quiere el pipeline en verde.
- Vitest frontend no arranca workers en este entorno WSL ("Timeout waiting for worker to respond") — limitación del entorno.

## Gotcha: proxy de Vite apuntaba al backend equivocado

Síntoma: el módulo Auditoría "no aparecía". En realidad el frontend servido en `:5173` era de otro proyecto (`~/Downloads/proyecto/Frontend`) y el proxy de Vite reenviaba `/api` a un backend viejo en `:3000` (host Windows, `env: production`, sin `/api/auditoria`).

Causa raíz encontrada tras diagnóstico: **`frontend/vite.config.js` (artefacto compilado por `tsc`) tiene prioridad sobre `vite.config.ts`** en la búsqueda de config de Vite, y estaba hardcodeado a `http://localhost:3000`. Editar solo el `.ts` no surtía efecto.

Solución aplicada: ambos archivos usan `target: process.env.VITE_BACKEND_PROXY ?? 'http://localhost:3000'`. Al regenerar con `tsc`, el `.js` se mantiene consistente con el `.ts`.

Mientras el backend viejo ocupe `:3000`, arrancar así:
- Backend dev: `PORT=3001 npx tsx watch src/app.ts` (desde `backend/`)
- Frontend: `VITE_BACKEND_PROXY=http://localhost:3001 npx vite` (desde `frontend/`)

Verificación end-to-end en vivo (2026-09-06, via `:5173`): login OK y `GET /api/auditoria?limite=3` → 200 con logs reales (LOGIN con `detalle` JSONB, `ip_origen`, `nombre_sucursal`). Los requests llegan al backend `:3001` (confirmado en su log).