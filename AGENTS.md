# Misión
Sistema de gestión de ventas, compras, citas, pacientes, empleados, y inventario para la clínica optométrica.
> Más detalle en `spec/constitution/mission.md`

# Tech-Stack

- **Frontend:** React + Vite + Tailwind.
- **Backend:** Node.js + Express + TypeScript.
- **DB:** PostgreSQL.
- **Monorepo:** npm workspaces (`backend/`, `frontend/`)
> Más detalle (versiones) en `spec/constitution/tech-stack.md`

# Convenciones y buenas prácticas
- Comenta siempre las funciones complejas
- Divide el código en componentes pequeños

# Prohibiciones
- Bajo ningún concepto dejes contraseñas o claves API en el código fuente.
- No modifiques la arquitectura base sin que lo aprobemos en el modo "Plan".

# Memoria y Documentación
- Solo cuando hayas verificado que todo funciona (lint → typecheck → tests → build pasan), guarda un resumen de lo que hiciste en la carpeta '/docs' para no perder el contexto.

##  Comandos de desarrollo (Correr desde la raíz)

| Comando | Descripción |
|---|---|
| `npm run dev` | Empieza ambos servidores de manera concurrente |
| `npm run build` | Construye el frontend y luego el backend |
| `npm run test:unit` | Jest (backend) + Vitest (frontend) |
| `npm run test:integration` | Playwright (Chromium only) |
| `npm run lint` | ESLint en ambos workspaces |

## Comandos de testeo (Correr desde el workspace)

| Alcance | Comando |
|---|---|
| Módulo backend específico | `npx jest --testPathPattern=autenticacion` |
| Archivo frontend específico | `npx vitest run lib/store.test.ts` |
| Test Playwright específico | `npx playwright test tests/integration/ventas.spec.js` |
| Test Playwright específico por nombre | `npx playwright test --grep "Gestión del carrito"` |

## Arquitectura

- **Backend:** Capas (controller → service → repository) por modulo dentro de `backend/src/modules/`.
- **Frontend:** Basado en características dentro de `frontend/src/features/`, páginas lazy-loaded.
- **Auth:** Token de acceso JWT (15 min, in-memory) + refresh token (7d, HttpOnly cookie).
- **API proxy:** Vite dev server proxies `/api` → `http://localhost:3000`
- **State:** Zustand for UI/auth, TanStack Query for server data
- **Router:** React Router con `RutaProtegida` para rutas protegidas.

## Convenciones clave & gotchas
- **Path alias:** `@/*` mapea a `frontend/src/*` — úsalo para todos los imports del frontend
- **Backend env:** `backend/.env` es obligatorio (copiar de `.env.example`). Usa `dotenv` + validación con Zod.
- **Root `.env`** es solo para Docker Compose en producción — no para desarrollo
- **Build frontend:** ejecuta `tsc --noEmit` y luego `vite build` — typecheck antes del build de producción
- **Esquema DB:** `basedatos.sql` monolítico — sin Flyway/Prisma/Knex migrations. Editar SQL directamente y re-ejecutar.
- **HTML legacy:** `interfaces/*.html` + `js/` + `css/` — páginas estáticas antiguas con Tailwind CDN, pendientes de migración
- **ESLint:** no hay archivo de configuración — flags en scripts de `package.json` (ej. `eslint src --ext .ts --max-warnings 0`)
- **Orden CI pipeline:** lint → unit tests → integration tests → docs generation
- **Generación de docs:** `node scripts/generate-docs.js` requiere la env var `OPENAI_API_KEY`
- **Puertos:** frontend 5173, backend 3000
- **Comandos lint:** `npm run lint:html` (HTMLHint) y `npm run lint:css` (Stylelint) existen en la raíz
- **Cobertura:** `npm run test:coverage` desde los directorios del workspace
