# Selector de Empresa en formulario de Pacientes + BarraBusqueda

## Resumen
Se agregó un campo `id_empresa` a la tabla `pacientes` para asociar un paciente a una empresa, junto con componentes UI reutilizables (`BarraBusqueda`, `SelectorBusqueda`) y short polling de 15s en tablas principales.

## Cambios realizados

### Base de datos — `basedatos.sql`
- Agregada columna `id_empresa INTEGER REFERENCES empresas(id_cliente) ON DELETE SET NULL` en la tabla `pacientes`.
- **Migración para BD existentes:** ejecutar `ALTER TABLE pacientes ADD COLUMN id_empresa INTEGER REFERENCES empresas(id_cliente) ON DELETE SET NULL;`

### Backend — `backend/src/modules/pacientes/`
- **`pacientes.types.ts`**:
  - `PacienteDb` ahora incluye `id_empresa: number | null`
  - `PacienteSchema` ahora acepta `id_empresa: z.number().int().positive().optional().nullable()`
- **`pacientes.repository.ts`**:
  - Todos los `SELECT` ahora incluyen `p.id_empresa`
  - `INSERT` en `pacientes` ahora incluye `id_empresa` ($5)
  - `UPDATE` en `pacientes` ahora incluye `id_empresa = COALESCE($4, id_empresa)`

### Frontend — nuevos componentes
- **`components/ui/BarraBusqueda.tsx`**: Wrapper de `<Campo icon="search">` con `div.w-full.md:w-80`. Props básicas: `id`, `placeholder`, `value`, `onChange`. Pasa el resto via `...props`.
- **`components/ui/SelectorBusqueda.tsx`**: Dropdown con búsqueda client-side. Genérico (template `<T>`). Recibe `options`, `value`, `onChange`, `getLabel`, `getKey`, `placeholder`, `searchPlaceholder`, `emptyMessage`, `loading`, `label`, `error`.

### Frontend — cambios en páginas
- **`features/pacientes/types/index.ts`**: `id_empresa?: number | null` agregado a `Paciente` y `PacienteFormInput`.
- **`features/pacientes/pages/PaginaPacientes.tsx`**:
  - Search bar reemplazada por `<BarraBusqueda>`
  - Modal de paciente ahora incluye `<SelectorBusqueda<Empresa>>` para seleccionar empresa
  - `handleOpenModal` setea `selectedEmpresa` desde `paciente.id_empresa`
  - `handleSave` envía `id_empresa` en el body
  - Query de pacientes y empresas usa `refetchInterval: 15000`
- **`features/pacientes/pages/PaginaEmpresas.tsx`**:
  - Search bar reemplazada por `<BarraBusqueda>`
  - Query de empresas usa `refetchInterval: 15000`
  - Se mantiene import de `Campo` porque se usa en el modal de empresa

### Short polling
- `refetchInterval: 15000` en queries de pacientes y empresas, para datos siempre frescos sin stale-while-revalidate.
