# 2026-10-19 — Fix: la página de Ventas aparecía y desaparecía en el frontend

## Síntoma

Al entrar a `http://localhost/ventas` (o cualquier ruta protegida) la página
aparecía por un instante y luego redirigía a `/login`. Al recargar pasaba lo
mismo.

## Causa raíz (dos bugs en el backend + uno de build)

1. **Faltaba `cookie-parser`.** `backend/src/app.ts` no registraba el middleware,
   así que `req.cookies` era siempre `undefined`. El endpoint
   `POST /api/auth/refresh` (que lee el refresh token de la cookie HttpOnly)
   respondía siempre `401 Refresh token no encontrado`.

2. **Cookie con `Secure` sobre HTTP.** `autenticacion.controller.ts` marcaba la
   cookie como `secure: process.env.NODE_ENV === 'production'`. Como el
   `docker-compose.yml` define `NODE_ENV: production`, la cookie se enviaba con
   `Secure; SameSite=Strict`. El navegador descarta cookies `Secure` sobre HTTP
   plano (`http://localhost`), por lo que el refresh token nunca llegaba.

   La cadena del fallo: al recargar, `isAuthenticated` se restaura desde
   `localStorage`, pero el `accessToken` (solo en memoria) se pierde → la primera
   llamada a la API devuelve `401` → `api.ts` intenta refrescar → falla →
   `clearSession()` + `window.location.href = '/login'`. De ahí que la página
   "se salga" sola.

3. **Build de Docker roto (silencioso).** Los `Dockerfile` de `backend/` y
   `frontend/` copiaban solo su propio `package.json` (sin `package-lock.json`)
   y corrían `npm install` en un contexto sin lockfile → error
   `npm error Cannot read properties of null (reading 'edgesOut')`. Docker
   reutilizaba la imagen cacheada anterior, por lo que los cambios de código
   **nunca llegaban al contenedor**.

## Cambios

- **`backend/src/app.ts`** — se importa y registra `cookieParser()`.
- **`backend/package.json`** — dependencia `cookie-parser` + `@types/cookie-parser`.
- **`backend/src/modules/autenticacion/autenticacion.controller.ts`** — la opción
  `secure` ahora se controla por env: `process.env.COOKIE_SECURE === 'true'`.
  En producción con HTTPS debe ser `COOKIE_SECURE=true`.
- **`docker-compose.yml`**
  - `COOKIE_SECURE: ${COOKIE_SECURE:-false}` en el servicio `backend` (HTTP local).
  - `context` de `backend` y `frontend` cambiado a la raíz del monorepo
    (`.`) para que el build disponga del `package-lock.json` de workspaces.
  - eliminada la línea obsoleta `version: '3.9'`.
- **`backend/Dockerfile`** y **`frontend/Dockerfile`** — build desde la raíz del
  monorepo usando `npm install --workspace=<ws>` y
  `npm run build --workspace=<ws>`.
- **`.dockerignore`** (nuevo, raíz) — excluye `node_modules`, `dist`, `.env`,
  `docs`, `spec`, `interfaces`, `js`, `css`.

## Verificación (todo en verde)

- `npm run lint` → OK.
- `npm run build` (frontend `tsc --noEmit && vite build` + backend `tsc`) → OK.
- `docker compose up --build` → contenedores `clinica_backend` y
  `clinica_frontend` recreados.
- Prueba end-to-end a través de nginx (`/api` proxy):
  1. `POST /api/auth/login` → `200`, cookie con `secure=false`.
  2. `POST /api/auth/refresh` → `200` (nuevo access token).
  3. `GET /api/ventas/productos-disponibles` → `200`, **6 productos**.
  4. `GET /ventas` → `200`, shell SPA (`#root`) correcto.

## Nota

`npm run test:unit` reporta 3 fallos en `citas.service.test.ts`
(disponibilidad horaria del optometrista). Son **preexistentes** y ajenos a este
cambio de autenticación: ese módulo ya estaba modificado en el árbol de trabajo
antes de esta corrección.
