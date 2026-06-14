# Plan de Desarrollo — Sistema Web para Clínica Optométrica
**Versión:** 1.0  
**Fecha:** Junio 2025  
**Rol:** Arquitecto de Software Senior / Líder Técnico  
**Estado:** Hoja de ruta maestra — No iniciar implementación hasta validar este documento

---

## Tabla de Contenidos

1. [Análisis Crítico del Estado Actual](#1-análisis-crítico-del-estado-actual)
2. [Análisis de la Base de Datos](#2-análisis-de-la-base-de-datos)
3. [Análisis de Requisitos vs. Base de Datos](#3-análisis-de-requisitos-vs-base-de-datos)
4. [Observaciones sobre el Sistema de Diseño](#4-observaciones-sobre-el-sistema-de-diseño)
5. [Decisiones de Arquitectura](#5-decisiones-de-arquitectura)
6. [Estructura del Proyecto](#6-estructura-del-proyecto)
7. [Sistema de Diseño e Interfaces Existentes](#7-sistema-de-diseño-e-interfaces-existentes)
8. [Módulos del Sistema y Plan de Implementación](#8-módulos-del-sistema-y-plan-de-implementación)
9. [Infraestructura y DevOps](#9-infraestructura-y-devops)
10. [Seguridad](#10-seguridad)
11. [Hoja de Ruta por Sprints](#11-hoja-de-ruta-por-sprints)
12. [Estándares y Convenciones](#12-estándares-y-convenciones)
13. [Riesgos y Mitigaciones](#13-riesgos-y-mitigaciones)

---

## 1. Análisis Crítico del Estado Actual

### 1.1 Resumen Ejecutivo

Tras revisar la especificación de requisitos, la base de datos versión 2.0 y el documento de diseño "The Clinical Ethereal", se concluye que:

- La base de datos está en un estado **maduro y bien corregido**. Cubre prácticamente todos los módulos funcionales requeridos, incluyendo aspectos que los requisitos escritos omitieron (sucursales, chatbot-relacionados con horarios, etc.).
- Los requisitos escritos son incompletos en varias áreas (sucursales, módulo de laboratorio, evaluación de calidad, módulo chatbot), pero la base de datos los compensa. El plan toma **la base de datos como fuente de verdad** sobre el alcance real del sistema.
- El sistema de diseño es sólido y diferenciador. Requiere configuración precisa de tokens en Tailwind 4.
- Existen **interfaces ya creadas en HTML/CSS** que deben ser migradas al stack tecnológico (React 19 + TypeScript + Tailwind 4) y asignadas a sus módulos correspondientes.
- Se identifican **mejoras menores recomendadas** en la base de datos que no son bloqueantes pero que aumentan la robustez.

### 1.2 Lo que está bien

- La base de datos v2.0 corrigió 19 errores críticos de la versión original.
- El diseño de triggers es correcto y cubre reglas de negocio esenciales.
- Los índices definidos son adecuados para las búsquedas más frecuentes.
- El seed data es completo y coherente con los requisitos.
- La arquitectura de herencia de tablas (clientes → pacientes / empresas) es una decisión técnica correcta.

---

## 2. Análisis de la Base de Datos

### 2.1 Tablas Existentes (37 tablas en total)

| Módulo | Tablas |
|--------|--------|
| Sucursales | `sucursales` |
| Usuarios y Seguridad | `roles`, `permisos`, `roles_permisos`, `empleados`, `usuarios`, `intentos_login`, `tokens_recuperacion`, `sesiones`, `logs_sistema` |
| Clientes | `clientes`, `pacientes`, `empresas` |
| Citas | `horarios_disponibles`, `citas` |
| Expedientes Clínicos | `historias_visuales`, `consultas`, `lensometrias_clinicas`, `recetas` |
| Productos Comerciales | `productos`, `marcos_oftalmologicos`, `gafas_sol`, `accesorios` |
| Lentes Clínicos | `tipos_lente`, `materiales_lente`, `filtros_lente`, `lentes_clinicos`, `lentes_clinicos_filtros` |
| Laboratorio y Calidad | `ordenes_laboratorio`, `lensometrias`, `evaluaciones_precision` |
| Inventario | `inventario_sucursal`, `movimientos_inventario` |
| Compras | `proveedores`, `compras`, `detalles_compra` |
| Ventas y Pedidos | `metodos_pago`, `pagos`, `pedidos`, `ventas`, `detalles_venta`, `detalles_pedido` |
| Promociones | `promociones`, `descuentos`, `promociones_descuentos`, `regalias` |
| Caja y Finanzas | `cajas`, `aperturas_caja`, `cierres_caja`, `movimientos_financieros`, `perdidas` |
| Configuración | `configuraciones_respaldo` |

### 2.2 Triggers Existentes (13 triggers)

| # | Trigger | Función |
|---|---------|---------|
| 1 | `tg_controlar_intentos_login` | Bloqueo automático tras 3 intentos fallidos |
| 2 | `tg_expirar_token_recuperacion` | Expiración automática de tokens (5 min) |
| 3 | `tg_validar_uso_token` | Validación antes de marcar token como usado |
| 4 | `tg_calcular_precio_lente` | Calcula precio base y total del lente clínico |
| 5a | `tg_sumar_precio_filtro` | Suma precio al agregar filtro |
| 5b | `tg_restar_precio_filtro` | Resta precio al eliminar filtro |
| 6 | `tg_restar_inventario_venta` | Descuenta inventario al vender |
| 7 | `tg_sumar_inventario_compra` | Incrementa inventario al comprar |
| 8 | `tg_calcular_totales_venta` | Calcula subtotal y total de venta |
| 9 | `tg_calcular_total_compra` | Calcula total de compra |
| 10 | `tg_calcular_proxima_revision` | Fecha de próxima revisión al completar cita |
| 11 | `tg_alerta_stock_minimo` | Alerta de stock mínimo en logs |
| 12 | `tg_validar_detalle_venta` | Valida que detalle referencie producto O lente |
| 13 | `tg_log_cambios_usuario` | Auditoría de cambios en usuarios |

### 2.3 Problemas Identificados y Mejoras Recomendadas

#### PROBLEMA DB-01 — Trigger 8 (totales de venta) puede resultar en total negativo
**Severidad:** Media  
**Descripción:** La función `fn_calcular_totales_venta` resta `descuento_aplicado` al subtotal sin verificar que el resultado sea ≥ 0. Si el descuento supera el subtotal, `total_venta` quedaría negativo, violando la restricción `CHECK(total_venta >= 0)` y causando un error en producción.  
**Solución propuesta:**
```sql
total_venta = GREATEST(
  COALESCE((SELECT SUM(subtotal) FROM detalles_venta WHERE id_venta = v_id_venta), 0)
  - descuento_aplicado,
  0
)
```

#### PROBLEMA DB-02 — `fecha_completada` en `ordenes_laboratorio` sin validación completa
**Severidad:** Baja  
**Descripción:** `CHECK(fecha_completada >= fecha_enviada)` falla si `fecha_enviada` es NULL (orden nunca enviada). El CHECK se evalúa como NULL y se permite la inconsistencia.  
**Solución propuesta:** Agregar validación en capa de aplicación (backend) además del CHECK existente.

#### PROBLEMA DB-03 — `clientes.numero_telefono` longitud insuficiente para formatos internacionales
**Severidad:** Baja  
**Descripción:** `VARCHAR(15)` puede ser limitante para números con código de país largo. En Nicaragua el formato `+505 XXXX-XXXX` cabe, pero vale la pena normalizar.  
**Solución propuesta:** Mantener `VARCHAR(15)` con validación de formato en backend.

#### PROBLEMA DB-04 — `pagos` no vinculado directamente a `ventas` de manera bidireccional
**Severidad:** Media  
**Descripción:** `ventas.id_pago` referencia a `pagos`, pero `pagos` no referencia a `ventas`. Esto dificulta la consulta "¿a qué venta pertenece este pago?" sin hacer JOIN.  
**Consideración:** La estructura actual es funcional para el flujo (se crea el pago primero y luego se asigna a la venta). No requiere cambio, pero sí documentación clara en el backend.

#### PROBLEMA DB-05 — `horarios_disponibles` no contempla excepciones (días festivos, vacaciones)
**Severidad:** Baja-Media  
**Descripción:** El módulo de citas muestra horarios disponibles basándose en `horarios_disponibles`, pero no hay forma de marcar días específicos como no disponibles (feriados, ausencias puntuales).  
**Solución propuesta (opcional):** Agregar tabla `excepciones_horario` en una iteración futura si el negocio lo requiere.

#### MEJORA DB-06 — Índice compuesto faltante en `lensometrias_clinicas`
**Severidad:** Baja  
**Descripción:** No existe índice en `lensometrias_clinicas.id_consulta`, lo cual afecta la consulta del historial clínico.  
**Solución propuesta:**
```sql
CREATE INDEX idx_lensometrias_clinicas_consulta ON lensometrias_clinicas(id_consulta);
CREATE INDEX idx_recetas_consulta ON recetas(id_consulta);
CREATE INDEX idx_ordenes_lente ON ordenes_laboratorio(id_lente_clinico);
```

#### MEJORA DB-07 — `empleados` sin campo `cargo` o `especialidad`
**Severidad:** Baja  
**Descripción:** El rol del usuario está en la tabla `usuarios`, pero `empleados` no tiene un campo de cargo o título (ej: "Optometrista Dr.", "Lic."). Esto podría necesitarse en reportes y recetas.  
**Solución propuesta:** Agregar campo `cargo VARCHAR(50)` a `empleados`.

#### MEJORA DB-08 — Falta campo `activo` en `cajas`
**Severidad:** Baja  
**Descripción:** El campo `activa` ya existe en `cajas`. Correcto. Sin observaciones adicionales.

#### MEJORA DB-09 — `detalles_pedido` no vincula lentes clínicos
**Severidad:** Media  
**Descripción:** `detalles_pedido` solo referencia `productos`, pero un pedido clínico contiene lentes clínicos personalizados, no productos del catálogo comercial. La entidad `pedidos` sí diferencia entre `'comercial'` y `'clinico'`, pero los detalles del pedido clínico no tienen dónde apuntar al lente clínico.  
**Solución propuesta:** Agregar columna opcional `id_lente_clinico` a `detalles_pedido`:
```sql
ALTER TABLE detalles_pedido ADD COLUMN id_lente_clinico INTEGER REFERENCES lentes_clinicos(id_lente_clinico);
```
Con validación via trigger similar a `detalles_venta`.

#### MEJORA DB-10 — No existe tabla de notificaciones
**Severidad:** Baja  
**Descripción:** El sistema genera alertas de stock mínimo en `logs_sistema`, pero no hay un mecanismo de notificaciones en-app para el usuario. Los logs son para auditoría técnica, no para alertas de negocio visibles en el dashboard.  
**Solución propuesta:** Agregar tabla `notificaciones` en una iteración posterior o manejar mediante polling desde el frontend al endpoint de alertas.

---

## 3. Análisis de Requisitos vs. Base de Datos

### 3.1 Requisitos cubiertos por la base de datos ✅

| Requisito | Estado |
|-----------|--------|
| Gestión de pacientes (registro, búsqueda, historial) | ✅ Tablas: `clientes`, `pacientes`, `historias_visuales` |
| Expedientes clínicos | ✅ Tablas: `consultas`, `recetas`, `lensometrias_clinicas` |
| Gestión de citas y horarios disponibles | ✅ Tablas: `citas`, `horarios_disponibles` |
| Gestión de productos (monturas, lentes, accesorios) | ✅ Tablas: `productos`, `marcos_oftalmologicos`, `gafas_sol`, `accesorios` |
| Lentes clínicos personalizados con precio calculado | ✅ Tablas: `lentes_clinicos`, `tipos_lente`, `materiales_lente`, `filtros_lente`, `lentes_clinicos_filtros` + triggers |
| Ventas y pedidos | ✅ Tablas: `ventas`, `pedidos`, `detalles_venta`, `detalles_pedido` |
| Compras y proveedores | ✅ Tablas: `compras`, `detalles_compra`, `proveedores` |
| Gestión de usuarios y roles | ✅ Tablas: `usuarios`, `roles`, `permisos`, `roles_permisos` |
| Autenticación y seguridad | ✅ Tablas: `intentos_login`, `tokens_recuperacion`, `sesiones` + triggers |
| Registro de logs | ✅ Tabla: `logs_sistema` |
| Inventario por sucursal | ✅ Tablas: `inventario_sucursal`, `movimientos_inventario` |
| Caja y movimientos financieros | ✅ Tablas: `cajas`, `aperturas_caja`, `cierres_caja`, `movimientos_financieros`, `perdidas` |
| Promociones y descuentos | ✅ Tablas: `promociones`, `descuentos`, `regalias` |
| Respaldos automáticos | ✅ Tabla: `configuraciones_respaldo` |
| Órdenes de laboratorio y control de calidad | ✅ Tablas: `ordenes_laboratorio`, `lensometrias`, `evaluaciones_precision` |
| Sucursales (omitido en requisitos escritos) | ✅ Tabla: `sucursales` |
| Empresas como clientes corporativos | ✅ Tabla: `empresas` |

### 3.2 Brechas entre requisitos escritos y la base de datos ⚠️

| Brecha | Descripción | Resolución |
|--------|-------------|------------|
| Chatbot de recepción (Módulo 2.4) | Los requisitos incluyen un chatbot, pero la BD no tiene tablas de conversación ni contexto de chatbot | Implementar como servicio independiente que consume la API del sistema. No requiere tablas adicionales para MVP; el chatbot usará los endpoints existentes de citas y pacientes |
| Dashboard y reportes (Módulos 2.9, 2.10) | No hay tablas de caché de estadísticas ni definición de KPIs en la BD | Las consultas del dashboard se harán mediante vistas o queries agregadas. En producción se puede agregar una tabla de caché si el rendimiento lo requiere |
| Exportación a Excel/PDF (Módulo 2.10) | No hay tablas para esto | Se implementa 100% en el backend como generación de archivos; no requiere persistencia |
| Reportes por commit (Secciones 12-13) | Son funcionalidades CI/CD | Se implementan en GitHub Actions, no en la BD |

### 3.3 Conclusión del Análisis

La base de datos v2.0 está **lista para comenzar el desarrollo**. Las mejoras identificadas (DB-01 a DB-10) se corregirán como primera tarea técnica antes de desarrollar la capa de aplicación. La brecha del chatbot requiere una decisión de arquitectura que se documenta en la sección 5.

---

## 4. Observaciones sobre el Sistema de Diseño

### 4.1 "The Clinical Ethereal" — Tokens a Configurar en Tailwind 4

El sistema de diseño define una paleta precisa. Estos tokens deben configurarse en `tailwind.config.ts` antes de iniciar cualquier componente:

```
Paleta de colores:
  primary:                    #00658d
  primary_container:          #00aeef
  surface:                    #f7f9fb        (fondo base)
  surface_container_lowest:   #ffffff        (tarjetas activas)
  surface_container_low:      #f2f4f6        (secciones agrupadas)
  surface_container:          #eceef0        (contenedores neutros)
  surface_container_high:     #e6e8ea        (contenido inactivo)
  on_surface:                 #191c1e        (texto principal — NUNCA #000000)
  tertiary:                   #8d4f00        (alertas, advertencias)
  secondary_container:        (resultado normal en chips clínicos)
  tertiary_container:         (resultado de advertencia en chips clínicos)
  outline_variant:            (borde fantasma al 15% de opacidad)

Tipografía:
  display/headline:   Manrope (Google Fonts)
  body/ui:            Inter (Google Fonts)

Reglas clave:
  - Prohibidos bordes 1px sólidos para separar contenido
  - Sombras máx. blur 32px, opacidad 6%
  - Gradiente primario: #00658d → #00aeef a 135°
  - Modales con backdrop-blur: 12px, opacidad 80%
  - Border-radius: xl (0.75rem) para tarjetas
```

### 4.2 Interfases Existentes (HTML/CSS) — Plan de Migración

Las interfaces ya creadas en HTML/CSS deben ser migradas y asignadas a sus módulos. El proceso para cada interfaz es:

1. Identificar a qué módulo pertenece la interfaz
2. Convertir el HTML estático a componente React con TypeScript
3. Aplicar los tokens del design system vía clases de Tailwind 4
4. Integrar con los hooks y servicios correspondientes
5. Conectar al endpoint de la API

Se asume que las interfaces pueden incluir algunas de las siguientes pantallas (a confirmar en sprint 0):
- Pantalla de login
- Dashboard principal
- Gestión de pacientes / formulario de registro
- Vista de citas / calendario
- Formulario de consulta clínica / receta
- Vista de productos / inventario
- Módulo de ventas / punto de venta
- Algún formulario de compras

Cada interfaz existente se documenta en el sprint correspondiente de su módulo.

---

## 5. Decisiones de Arquitectura

### 5.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│              React 19 + TypeScript + Tailwind 4             │
│                    (Vite 8 como bundler)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
                           │ JWT en Authorization header
┌──────────────────────────▼──────────────────────────────────┐
│                        BACKEND                              │
│             Node.js 24 LTS + TypeScript + Express           │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Auth    │ Pacient. │  Citas   │ Ventas   │  ...     │  │
│  │ Module   │ Module   │  Module  │  Module  │  Módulos │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                    Capa de Servicios                        │
│                    Capa de Repositorios                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ pg / node-postgres
┌──────────────────────────▼──────────────────────────────────┐
│                     PostgreSQL 16                           │
│          (Triggers, Índices, Constraints, Seeds)            │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Decisiones Técnicas Clave

#### Backend: Patrón de Capas
```
src/
  modules/
    {modulo}/
      {modulo}.controller.ts   → Manejo de HTTP (req/res)
      {modulo}.service.ts      → Lógica de negocio
      {modulo}.repository.ts   → Acceso a base de datos
      {modulo}.routes.ts       → Definición de rutas
      {modulo}.types.ts        → Interfaces y tipos TypeScript
      {modulo}.validation.ts   → Esquemas de validación (Zod)
```

#### Frontend: Patrón de Features
```
src/
  features/
    {modulo}/
      components/              → Componentes UI del módulo
      hooks/                   → Custom hooks (useQuery, useMutation)
      services/                → Llamadas a la API
      types/                   → Tipos TypeScript del módulo
      pages/                   → Páginas/vistas del módulo
```

#### Autenticación: JWT con Refresh Tokens
- **Access Token:** Duración 15 minutos, almacenado en memoria (no localStorage)
- **Refresh Token:** Duración 7 días, almacenado en cookie HttpOnly
- **Rationale:** Protege contra XSS (no hay tokens en localStorage) y CSRF (SameSite=Strict en cookies)

#### Chatbot (Módulo 2.4)
- Se implementará como un **componente de chat embebido** en el frontend
- El chatbot se comunica con el backend mediante un endpoint `/api/chatbot/message`
- El backend procesa la intención (usando lógica de reglas o integración con API de IA) y consulta los servicios existentes (citas, horarios, pacientes)
- **No requiere tablas adicionales** para el MVP

#### Exportación de Reportes
- Excel: Librería `exceljs` en el backend
- PDF: Librería `pdfkit` o `puppeteer` (HTML to PDF) en el backend
- Los reportes se generan bajo demanda vía endpoint y se envían como stream descargable

#### Gestión de Estado Global (Frontend)
- **Zustand** para estado global liviano (sesión de usuario, configuración)
- **TanStack Query** para cache y sincronización de datos del servidor
- Estado local de componentes con `useState` y `useReducer`

### 5.3 Convenciones de API REST

```
GET    /api/{modulo}           → Listar (con paginación y filtros)
GET    /api/{modulo}/:id       → Obtener uno
POST   /api/{modulo}           → Crear
PUT    /api/{modulo}/:id       → Actualizar completo
PATCH  /api/{modulo}/:id       → Actualizar parcial
DELETE /api/{modulo}/:id       → Eliminar (lógico cuando corresponda)
```

Respuesta estándar:
```typescript
// Éxito
{ ok: true, data: T, mensaje?: string }

// Error
{ ok: false, error: string, detalles?: Record<string, string[]> }

// Listado con paginación
{ ok: true, data: T[], total: number, pagina: number, limite: number }
```

---

## 6. Estructura del Proyecto

### 6.1 Estructura de Repositorio (Monorepo)

```
clinica-optometrica/
├── .github/
│   └── workflows/
│       ├── ci.yml                    → Pruebas e integración continua
│       ├── reporte-commit.yml        → Generación automática de reportes
│       └── cd.yml                    → Despliegue (futuro)
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts           → Configuración de pg pool
│   │   │   ├── env.ts                → Validación de variables de entorno
│   │   │   └── jwt.ts                → Configuración de JWT
│   │   ├── middleware/
│   │   │   ├── autenticacion.ts      → Validación de JWT
│   │   │   ├── autorizacion.ts       → Control de permisos por rol
│   │   │   ├── manejo-errores.ts     → Error handler centralizado
│   │   │   ├── validacion.ts         → Middleware de validación con Zod
│   │   │   └── logger.ts             → Registro de peticiones
│   │   ├── modules/
│   │   │   ├── autenticacion/
│   │   │   ├── sucursales/
│   │   │   ├── usuarios/
│   │   │   ├── pacientes/
│   │   │   ├── empresas/
│   │   │   ├── citas/
│   │   │   ├── expedientes/
│   │   │   ├── productos/
│   │   │   ├── inventario/
│   │   │   ├── lentes-clinicos/
│   │   │   ├── ordenes-laboratorio/
│   │   │   ├── ventas/
│   │   │   ├── compras/
│   │   │   ├── caja/
│   │   │   ├── promociones/
│   │   │   ├── reportes/
│   │   │   ├── dashboard/
│   │   │   └── chatbot/
│   │   ├── shared/
│   │   │   ├── types/                → Tipos compartidos
│   │   │   ├── utils/                → Utilidades (paginación, formato, etc.)
│   │   │   └── validators/           → Validadores reutilizables (Zod)
│   │   ├── database/
│   │   │   ├── migrations/           → Scripts SQL de migración
│   │   │   └── seeds/                → Datos iniciales (ya en basededatos.sql)
│   │   └── app.ts                    → Punto de entrada de la aplicación
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── fonts/                → Manrope e Inter (local o CDN)
│   │   ├── components/
│   │   │   ├── ui/                   → Componentes base del design system
│   │   │   │   ├── Boton.tsx
│   │   │   │   ├── Campo.tsx
│   │   │   │   ├── Tarjeta.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Tabla.tsx
│   │   │   │   ├── Insignia.tsx      → Badge/Chip clínico
│   │   │   │   ├── CargadorIris.tsx  → Loader animado del design system
│   │   │   │   └── Notificacion.tsx  → Wrapper de Sonner
│   │   │   └── layout/
│   │   │       ├── BarraLateral.tsx
│   │   │       ├── BarraSuperior.tsx
│   │   │       ├── PlantillaAutenticada.tsx
│   │   │       └── PlantillaPublica.tsx
│   │   ├── features/
│   │   │   ├── autenticacion/
│   │   │   ├── dashboard/
│   │   │   ├── sucursales/
│   │   │   ├── pacientes/
│   │   │   ├── citas/
│   │   │   ├── expedientes/
│   │   │   ├── productos/
│   │   │   ├── inventario/
│   │   │   ├── lentes-clinicos/
│   │   │   ├── ordenes-laboratorio/
│   │   │   ├── ventas/
│   │   │   ├── compras/
│   │   │   ├── caja/
│   │   │   ├── promociones/
│   │   │   ├── reportes/
│   │   │   ├── usuarios/
│   │   │   └── chatbot/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePaginacion.ts
│   │   │   └── usePermisos.ts
│   │   ├── lib/
│   │   │   ├── api.ts                → Cliente HTTP (fetch wrapper)
│   │   │   ├── query-client.ts       → Configuración de TanStack Query
│   │   │   └── store.ts              → Store de Zustand
│   │   ├── router/
│   │   │   └── index.tsx             → React Router con rutas protegidas
│   │   ├── styles/
│   │   │   └── globals.css           → Variables CSS + Tailwind imports
│   │   └── main.tsx
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── basededatos.sql               → Script principal de la BD
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

### 6.2 Ramas de Git

```
main              → Producción estable
develop           → Integración de features
feature/sprint-0-fundamentos
feature/modulo-autenticacion
feature/modulo-sucursales
feature/modulo-pacientes
feature/modulo-citas
feature/modulo-expedientes
feature/modulo-productos
feature/modulo-lentes-clinicos
feature/modulo-ordenes-laboratorio
feature/modulo-inventario
feature/modulo-ventas
feature/modulo-compras
feature/modulo-caja
feature/modulo-promociones
feature/modulo-usuarios
feature/modulo-dashboard
feature/modulo-reportes
feature/chatbot-recepcionista
```

---

## 7. Sistema de Diseño e Interfaces Existentes

### 7.1 Proceso de Migración de Interfaces HTML/CSS → React + TypeScript + Tailwind 4

Para cada interfaz existente, se seguirá este proceso estándar:

**Paso 1 — Inventario:** Catalogar cada archivo HTML/CSS existente, identificar a qué módulo pertenece y qué componentes contiene.

**Paso 2 — Tokenización:** Reemplazar colores hardcodeados por los tokens del design system ("The Clinical Ethereal"). Ningún color hexadecimal va directo en un componente; siempre se usa la clase Tailwind del token.

**Paso 3 — Componentización:** Descomponer la pantalla en componentes reutilizables. Aplicar la nomenclatura PascalCase definida en los requisitos.

**Paso 4 — Tipado:** Agregar las interfaces TypeScript para las props de cada componente y los tipos de datos que recibe.

**Paso 5 — Integración:** Conectar el componente con el hook correspondiente (TanStack Query) y el servicio de API.

### 7.2 Componentes Base del Design System (Prioridad Sprint 0)

Antes de migrar cualquier interfaz de módulo, se construirán estos componentes base que todos los módulos reutilizarán:

| Componente | Descripción | Reglas de Diseño Aplicadas |
|-----------|-------------|---------------------------|
| `Boton` | Primario, Secundario, Fantasma | Gradiente 135° en primario; sin borde en secundario |
| `Campo` | Input de texto, select, textarea | Fondo `surface-container-low`; halo de foco 2px |
| `Tarjeta` | Contenedor base de datos | Rounded xl; sin líneas divisoras; sombra 6% |
| `Modal` | Overlay con glassmorphism | backdrop-blur 12px; opacidad 80% |
| `Tabla` | Tabla de datos paginada | Separación por color, no por líneas |
| `Insignia` | Chip de estado/resultado | `secondary_container` normal, `tertiary_container` advertencia |
| `CargadorIris` | Loading state temático | Círculos concéntricos en `primary_fixed_dim` |
| `Notificacion` | Toast wrapper de Sonner | Configurado con tokens del design system |
| `BarraLateral` | Navegación principal | Colores del sistema, íconos consistentes |
| `BarraSuperior` | Header con usuario activo | Gradiente primario |

### 7.3 Configuración de Tailwind 4

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00658d',
        'primary-container': '#00aeef',
        surface: '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'on-surface': '#191c1e',
        tertiary: '#8d4f00',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        'lg': '0.5rem',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #00658d, #00aeef)',
      },
      boxShadow: {
        'ambient': '0 8px 32px rgba(25, 28, 30, 0.06)',
        'float': '0 16px 32px rgba(25, 28, 30, 0.06)',
      },
    },
  },
}
```

---

## 8. Módulos del Sistema y Plan de Implementación

Para cada módulo se describen: las tablas de la BD que usa, las interfaces existentes a migrar, los endpoints a implementar, los componentes React a crear y los criterios de aceptación.

---

### MÓDULO 0 — Fundamentos e Infraestructura

**Objetivo:** Establecer la base técnica sobre la que todos los módulos funcionarán.

**Tareas de Base de Datos:**
- Ejecutar `basededatos.sql` en contenedor PostgreSQL
- Aplicar correcciones identificadas (DB-01, DB-06, DB-09)
- Verificar que todos los triggers funcionan correctamente
- Agregar índices faltantes (DB-06)

**Tareas de Backend:**
- Configurar proyecto Node.js 24 + TypeScript + Express
- Configurar `pg` pool de conexiones con variables de entorno
- Implementar middleware de manejo centralizado de errores
- Implementar middleware de logger de peticiones
- Configurar Zod para validación de esquemas
- Configurar estructura de respuestas estándar
- Configurar CORS, Helmet, rate limiting

**Tareas de Frontend:**
- Configurar proyecto React 19 + Vite 8 + TypeScript
- Configurar Tailwind 4 con los tokens del design system
- Instalar y configurar TanStack Query, Zustand, React Router, Sonner
- Importar fuentes Manrope e Inter
- Crear los 10 componentes base del design system (ver sección 7.2)
- Configurar cliente HTTP (`lib/api.ts`) con interceptores de autenticación
- Configurar React Router con rutas protegidas y públicas

**Tareas de Infraestructura:**
- Crear `Dockerfile` de backend (Node.js 24 Alpine)
- Crear `Dockerfile` de frontend (Nginx para producción, Vite dev server para desarrollo)
- Crear `docker-compose.yml` con servicios: `frontend`, `backend`, `db`, `pgadmin`
- Crear `docker-compose.dev.yml` con hot-reload para desarrollo
- Configurar `.env.example` con todas las variables necesarias
- Crear `README.md` con instrucciones de inicio

**Interfaces existentes a migrar:** Pantalla de login (si existe)

---

### MÓDULO 1 — Autenticación y Seguridad

**Tablas BD:** `usuarios`, `roles`, `permisos`, `roles_permisos`, `empleados`, `intentos_login`, `tokens_recuperacion`, `sesiones`, `logs_sistema`

**Endpoints a implementar:**
```
POST   /api/auth/login                    → Inicio de sesión
POST   /api/auth/logout                   → Cierre de sesión
POST   /api/auth/recuperar-contrasena     → Solicitar recuperación
POST   /api/auth/restablecer-contrasena   → Usar token para nueva contraseña
GET    /api/auth/verificar                → Verificar sesión activa
GET    /api/auth/perfil                   → Datos del usuario autenticado
```

**Lógica de negocio:**
- Validar credenciales → registrar en `intentos_login` (trigger maneja el bloqueo)
- En login exitoso: generar JWT access token (15 min) + refresh token (7 días, cookie HttpOnly)
- Recuperación: generar token único → insertar en `tokens_recuperacion` (trigger asigna expiración 5 min) → enviar email
- Restablecimiento: validar token → actualizar `contrasena_hash` con bcrypt → marcar token como utilizado

**Componentes React:**
- `PaginaLogin.tsx` → migrar interfaz existente si aplica
- `FormularioLogin.tsx`
- `FormularioRecuperacion.tsx`
- `FormularioRestablecimiento.tsx`
- `hooks/useAuth.ts` → manejo de sesión global vía Zustand
- `hooks/usePermisos.ts` → verificación de permisos por módulo

**Criterios de aceptación:**
- ✓ Bloqueo automático después de 3 intentos fallidos en 15 minutos
- ✓ Token de recuperación expira en exactamente 5 minutos
- ✓ Contraseñas hasheadas con bcrypt (salt rounds: 12)
- ✓ Rutas protegidas redirigen a login si no hay sesión válida
- ✓ Refresh automático de access token usando refresh token

---

### MÓDULO 2 — Sucursales

**Tablas BD:** `sucursales`, `empleados` (campo `id_sucursal`), `inventario_sucursal`, `cajas`

**Endpoints a implementar:**
```
GET    /api/sucursales             → Listar sucursales
GET    /api/sucursales/:id         → Obtener sucursal
POST   /api/sucursales             → Crear sucursal [Admin]
PUT    /api/sucursales/:id         → Actualizar sucursal [Admin]
PATCH  /api/sucursales/:id/estado  → Activar/desactivar [Admin]
GET    /api/sucursales/:id/empleados → Empleados de una sucursal
```

**Componentes React:**
- `PaginaSucursales.tsx`
- `TablaSucursales.tsx`
- `FormularioSucursal.tsx` (modal)
- `TarjetaSucursal.tsx`

**Permisos:** Solo rol Administrador puede crear/editar/desactivar sucursales.

---

### MÓDULO 3 — Gestión de Usuarios y Empleados

**Tablas BD:** `usuarios`, `empleados`, `roles`, `permisos`, `roles_permisos`, `sucursales`

**Endpoints a implementar:**
```
GET    /api/usuarios               → Listar usuarios [Admin]
GET    /api/usuarios/:id           → Obtener usuario [Admin]
POST   /api/usuarios               → Crear usuario + empleado [Admin]
PUT    /api/usuarios/:id           → Actualizar usuario [Admin]
PATCH  /api/usuarios/:id/estado    → Activar/desactivar [Admin]
PATCH  /api/usuarios/:id/desbloquear → Desbloquear usuario [Admin]

GET    /api/roles                  → Listar roles
GET    /api/permisos               → Listar permisos
PUT    /api/roles/:id/permisos     → Asignar permisos a un rol [Admin]

GET    /api/empleados              → Listar empleados
GET    /api/empleados/:id          → Obtener empleado
```

**Interfaces existentes a migrar:** Gestión de usuarios si existe

**Componentes React:**
- `PaginaUsuarios.tsx`
- `TablaUsuarios.tsx`
- `FormularioUsuario.tsx` (crea empleado + usuario en un solo flujo)
- `TarjetaPermisos.tsx` → grid de permisos por módulo por rol
- `InsigniaRol.tsx` → badge con el rol del usuario

**Criterios de aceptación:**
- ✓ Crear usuario siempre crea el empleado vinculado
- ✓ Desactivar usuario no elimina el registro (baja lógica)
- ✓ El administrador puede desbloquear usuarios bloqueados manualmente

---

### MÓDULO 4 — Gestión de Pacientes y Empresas

**Tablas BD:** `clientes`, `pacientes`, `empresas`

**Endpoints a implementar:**
```
GET    /api/pacientes              → Listar pacientes (búsqueda por nombre, cédula, teléfono)
GET    /api/pacientes/:id          → Obtener paciente con historial completo
POST   /api/pacientes              → Registrar paciente
PUT    /api/pacientes/:id          → Actualizar paciente
GET    /api/pacientes/:id/citas    → Citas del paciente
GET    /api/pacientes/:id/historia → Historial clínico del paciente

GET    /api/empresas               → Listar empresas
GET    /api/empresas/:id           → Obtener empresa
POST   /api/empresas               → Registrar empresa
PUT    /api/empresas/:id           → Actualizar empresa
```

**Interfaces existentes a migrar:** Tabla de pacientes, formulario de registro de paciente

**Componentes React:**
- `PaginaPacientes.tsx`
- `TablaPacientes.tsx` → con búsqueda en tiempo real
- `FormularioPaciente.tsx` → crea cliente + paciente
- `TarjetaPaciente.tsx` → vista rápida (quickview modal)
- `HistorialPaciente.tsx` → timeline de citas y consultas
- `PaginaEmpresas.tsx`
- `FormularioEmpresa.tsx`

**Criterios de aceptación:**
- ✓ Búsqueda por nombre, apellido, cédula y teléfono
- ✓ Crear paciente automáticamente crea el registro en `clientes` y `pacientes`
- ✓ La cédula es única en el sistema

---

### MÓDULO 5 — Gestión de Citas

**Tablas BD:** `citas`, `horarios_disponibles`, `pacientes`, `empleados`

**Endpoints a implementar:**
```
GET    /api/citas                  → Listar citas (filtros: fecha, estado, empleado, paciente)
GET    /api/citas/:id              → Obtener cita
POST   /api/citas                  → Crear cita
PUT    /api/citas/:id              → Actualizar/reprogramar cita
PATCH  /api/citas/:id/estado       → Cambiar estado (confirmar, cancelar, completar)
GET    /api/citas/disponibilidad   → Consultar horarios disponibles por optometrista y fecha

GET    /api/horarios               → Listar horarios por empleado
POST   /api/horarios               → Crear horario disponible
PUT    /api/horarios/:id           → Actualizar horario
DELETE /api/horarios/:id           → Eliminar horario
```

**Interfaces existentes a migrar:** Calendario/agenda de citas si existe

**Componentes React:**
- `PaginaCitas.tsx`
- `CalendarioCitas.tsx` → vista semanal/mensual interactiva
- `TarjetaCita.tsx` → resumen de una cita con cambio de estado
- `FormularioCita.tsx` → selección de paciente, optometrista, fecha/hora disponible
- `SelectorHorario.tsx` → grid de slots disponibles
- `HistorialCitas.tsx` → tabla de citas pasadas de un paciente

**Criterios de aceptación:**
- ✓ Al completar una cita, el trigger calcula automáticamente `fecha_proxima_revision`
- ✓ No se permite crear cita en horario no disponible
- ✓ El sistema muestra slots libres basados en `horarios_disponibles`

---

### MÓDULO 6 — Expedientes Clínicos

**Tablas BD:** `historias_visuales`, `consultas`, `lensometrias_clinicas`, `recetas`

**Endpoints a implementar:**
```
GET    /api/expedientes/:id_paciente   → Historia visual del paciente
POST   /api/expedientes                → Crear historia visual (primera vez)

GET    /api/consultas/:id              → Obtener consulta completa
POST   /api/consultas                  → Registrar consulta (desde cita completada)
GET    /api/consultas/:id/lensometria  → Lensometría clínica de la consulta
POST   /api/consultas/:id/lensometria  → Registrar lensometría del paciente

GET    /api/recetas/:id                → Obtener receta
POST   /api/recetas                    → Emitir receta (desde consulta)
GET    /api/recetas/:id/pdf            → Exportar receta como PDF
```

**Interfaces existentes a migrar:** Formulario de consulta clínica, vista de receta

**Componentes React:**
- `PaginaExpediente.tsx` → vista completa del historial clínico
- `TimelineConsultas.tsx` → cronología de consultas
- `FormularioConsulta.tsx` → registro de observaciones + lensometría
- `FormularioReceta.tsx` → grilla de campos OD/OI con validación
- `TarjetaReceta.tsx` → vista de receta emitida con botón de impresión/PDF
- `ChipAgudezaVisual.tsx` → chip clínico (Normal/Advertencia) del design system

**Criterios de aceptación:**
- ✓ Cada paciente tiene máximo una historia visual (UNIQUE en BD)
- ✓ Una consulta solo puede vincularse a una cita (UNIQUE en BD)
- ✓ La receta se puede exportar a PDF desde la vista del expediente
- ✓ Los campos numéricos de la receta (esfera, cilindro, eje) tienen validación de rangos

---

### MÓDULO 7 — Gestión de Productos e Inventario

**Tablas BD:** `productos`, `marcos_oftalmologicos`, `gafas_sol`, `accesorios`, `inventario_sucursal`, `movimientos_inventario`

**Endpoints a implementar:**
```
GET    /api/productos              → Listar productos (filtros: tipo, activo, búsqueda)
GET    /api/productos/:id          → Obtener producto con detalles específicos
POST   /api/productos              → Crear producto (+ subentidad según tipo)
PUT    /api/productos/:id          → Actualizar producto
PATCH  /api/productos/:id/estado   → Activar/desactivar
DELETE /api/productos/:id          → Desactivar (baja lógica)

GET    /api/inventario             → Stock actual por sucursal
GET    /api/inventario/alertas     → Productos con stock mínimo alcanzado
PATCH  /api/inventario/ajuste      → Ajuste manual de inventario [Admin]
GET    /api/inventario/movimientos → Historial de movimientos
GET    /api/inventario/transferencias → Historial de transferencias entre sucursales
POST   /api/inventario/transferencia  → Transferir stock entre sucursales
```

**Interfaces existentes a migrar:** Catálogo de productos, tabla de inventario

**Componentes React:**
- `PaginaProductos.tsx`
- `TablaProductos.tsx` → con filtros por tipo de producto
- `FormularioProducto.tsx` → dinámico según tipo (muestra campos de montura, gafas, etc.)
- `TarjetaProducto.tsx`
- `PaginaInventario.tsx`
- `TablaInventario.tsx` → con columna de estado de stock (normal/bajo/crítico)
- `AlertasStock.tsx` → panel de productos con stock mínimo
- `FormularioAjusteInventario.tsx`
- `ModalTransferencia.tsx`

**Criterios de aceptación:**
- ✓ Al crear un `marco_oftalmologico`, se crea primero el `producto` padre
- ✓ Las alertas de stock mínimo se muestran en tiempo real (polling o al cargar el dashboard)
- ✓ Todo movimiento de inventario queda registrado en `movimientos_inventario`

---

### MÓDULO 8 — Lentes Clínicos

**Tablas BD:** `tipos_lente`, `materiales_lente`, `filtros_lente`, `lentes_clinicos`, `lentes_clinicos_filtros`

**Endpoints a implementar:**
```
GET    /api/tipos-lente            → Listar tipos de lente
POST   /api/tipos-lente            → Crear tipo de lente
PUT    /api/tipos-lente/:id        → Actualizar tipo de lente

GET    /api/materiales-lente       → Listar materiales
POST   /api/materiales-lente       → Crear material
PUT    /api/materiales-lente/:id   → Actualizar material

GET    /api/filtros-lente          → Listar filtros y tratamientos
POST   /api/filtros-lente          → Crear filtro
PUT    /api/filtros-lente/:id      → Actualizar filtro

GET    /api/lentes-clinicos/:id    → Obtener configuración de lente clínico
POST   /api/lentes-clinicos        → Crear configuración de lente (desde receta)
POST   /api/lentes-clinicos/:id/filtros  → Agregar filtro a lente
DELETE /api/lentes-clinicos/:id/filtros/:id_filtro → Quitar filtro
```

**Componentes React:**
- `ConfiguradorLente.tsx` → wizard paso a paso (tipo → material → filtros → precio calculado)
- `ResumenConfiguracionLente.tsx` → tarjeta con desglose de precio
- `PaginaConfiguracion.tsx` → administración de tipos, materiales y filtros (para admin)
- `FormularioTipoLente.tsx`
- `FormularioMaterial.tsx`
- `FormularioFiltro.tsx`

**Criterios de aceptación:**
- ✓ El precio total se calcula automáticamente por los triggers de la BD
- ✓ El configurador muestra el desglose: precio base + material + filtros = total
- ✓ Se pueden agregar múltiples filtros a un lente

---

### MÓDULO 9 — Órdenes de Laboratorio y Control de Calidad

**Tablas BD:** `ordenes_laboratorio`, `lensometrias`, `evaluaciones_precision`

**Endpoints a implementar:**
```
GET    /api/ordenes-laboratorio        → Listar órdenes (filtros: estado, empleado)
GET    /api/ordenes-laboratorio/:id    → Obtener orden completa
POST   /api/ordenes-laboratorio        → Crear orden (desde lente clínico)
PATCH  /api/ordenes-laboratorio/:id/estado → Avanzar estado de la orden
POST   /api/ordenes-laboratorio/:id/lensometria  → Registrar lensometría del lente recibido
POST   /api/ordenes-laboratorio/:id/evaluacion   → Registrar evaluación de precisión
GET    /api/ordenes-laboratorio/:id/evaluacion   → Obtener resultado de evaluación
```

**Componentes React:**
- `PaginaOrdenesLaboratorio.tsx`
- `TablaOrdenes.tsx` → con estados visuales por color
- `TarjetaOrden.tsx` → progreso de la orden en el laboratorio
- `FormularioLensometriaRecibida.tsx` → ingreso del lente recibido
- `ResultadoEvaluacion.tsx` → tabla de diferencias OD/OI con indicador aceptable/no aceptable

---

### MÓDULO 10 — Gestión de Ventas y Pedidos

**Tablas BD:** `ventas`, `detalles_venta`, `pedidos`, `detalles_pedido`, `pagos`, `metodos_pago`, `clientes`

**Endpoints a implementar:**
```
GET    /api/ventas                 → Listar ventas (filtros: fecha, estado, cliente)
GET    /api/ventas/:id             → Obtener venta con detalles
POST   /api/ventas                 → Iniciar venta
POST   /api/ventas/:id/detalles    → Agregar producto/lente a la venta
DELETE /api/ventas/:id/detalles/:id_detalle → Quitar ítem
PATCH  /api/ventas/:id/descuento   → Aplicar descuento
POST   /api/ventas/:id/pago        → Registrar pago y finalizar venta
PATCH  /api/ventas/:id/cancelar    → Cancelar venta

GET    /api/pedidos                → Listar pedidos
GET    /api/pedidos/:id            → Obtener pedido
POST   /api/pedidos                → Crear pedido
PATCH  /api/pedidos/:id/estado     → Actualizar estado del pedido
GET    /api/pedidos/pendientes      → Pedidos con lentes sin entregar

GET    /api/metodos-pago           → Listar métodos de pago activos
```

**Interfaces existentes a migrar:** Punto de venta / caja registradora, historial de ventas, vista de pedidos

**Componentes React:**
- `PaginaVentas.tsx`
- `TablaVentas.tsx`
- `PuntoVenta.tsx` → UI de creación de venta (buscar cliente, agregar ítems, calcular total)
- `BuscadorProductos.tsx` → búsqueda rápida de productos con stock disponible
- `CarritoVenta.tsx` → lista de ítems en la venta actual
- `FormularioPago.tsx` → selección de método y monto
- `ComprobanteVenta.tsx` → vista del comprobante con opción de impresión/PDF
- `PaginaPedidos.tsx`
- `TablaPedidos.tsx` → con filtro de lentes pendientes de entrega
- `TarjetaPedido.tsx` → progreso del pedido

**Criterios de aceptación:**
- ✓ Al agregar un producto, el stock se valida antes de confirmar (trigger lo maneja en BD)
- ✓ Los totales se calculan en tiempo real vía triggers
- ✓ Al finalizar la venta con lentes clínicos, se crea el pedido vinculado
- ✓ El comprobante es exportable a PDF

---

### MÓDULO 11 — Gestión de Compras y Proveedores

**Tablas BD:** `compras`, `detalles_compra`, `proveedores`

**Endpoints a implementar:**
```
GET    /api/proveedores            → Listar proveedores
GET    /api/proveedores/:id        → Obtener proveedor
POST   /api/proveedores            → Registrar proveedor
PUT    /api/proveedores/:id        → Actualizar proveedor
PATCH  /api/proveedores/:id/estado → Activar/desactivar

GET    /api/compras                → Listar compras
GET    /api/compras/:id            → Obtener compra con detalles
POST   /api/compras                → Iniciar compra
POST   /api/compras/:id/detalles   → Agregar producto a la compra
PATCH  /api/compras/:id/finalizar  → Finalizar compra (actualiza inventario via trigger)
PATCH  /api/compras/:id/cancelar   → Cancelar compra
```

**Interfaces existentes a migrar:** Lista de proveedores, historial de compras

**Componentes React:**
- `PaginaProveedores.tsx`
- `TablaProveedores.tsx`
- `FormularioProveedor.tsx`
- `PaginaCompras.tsx`
- `TablaCompras.tsx`
- `FormularioCompra.tsx` → selección de proveedor + ítems
- `DetalleCompra.tsx`

---

### MÓDULO 12 — Caja y Movimientos Financieros

**Tablas BD:** `cajas`, `aperturas_caja`, `cierres_caja`, `movimientos_financieros`, `perdidas`

**Endpoints a implementar:**
```
GET    /api/cajas                  → Listar cajas por sucursal
POST   /api/cajas                  → Crear caja [Admin]
POST   /api/cajas/:id/apertura     → Abrir caja del día
POST   /api/cajas/:id/cierre       → Cerrar caja del día
GET    /api/cajas/:id/estado       → Estado actual (abierta/cerrada)
GET    /api/cajas/:id/movimientos  → Movimientos de la sesión actual
POST   /api/movimientos-financieros → Registrar movimiento manual (ingreso/egreso)
GET    /api/perdidas               → Listar pérdidas
POST   /api/perdidas               → Registrar pérdida
```

**Componentes React:**
- `PaginaCaja.tsx` → control de apertura y cierre
- `ResumenCaja.tsx` → totales del día, ingresos vs egresos
- `TablaMovimientos.tsx`
- `FormularioApertura.tsx`
- `FormularioCierre.tsx` → con comparativa monto esperado vs real
- `FormularioPerdida.tsx`

---

### MÓDULO 13 — Promociones y Descuentos

**Tablas BD:** `promociones`, `descuentos`, `promociones_descuentos`, `regalias`

**Endpoints a implementar:**
```
GET    /api/promociones            → Listar promociones activas
GET    /api/promociones/:id        → Obtener promoción
POST   /api/promociones            → Crear promoción
PUT    /api/promociones/:id        → Actualizar promoción
PATCH  /api/promociones/:id/estado → Activar/desactivar

GET    /api/descuentos             → Listar descuentos
POST   /api/descuentos             → Crear descuento

POST   /api/promociones/:id/descuentos/:id_descuento → Vincular descuento a promoción
DELETE /api/promociones/:id/descuentos/:id_descuento → Desvincular
```

**Componentes React:**
- `PaginaPromociones.tsx`
- `TablaPromociones.tsx`
- `FormularioPromocion.tsx`
- `FormularioDescuento.tsx`
- `SelectorPromocion.tsx` → usado en el punto de venta

---

### MÓDULO 14 — Dashboard

**Objetivo:** Proporcionar una visión ejecutiva del negocio con KPIs en tiempo real.

**Endpoints a implementar (queries agregadas):**
```
GET    /api/dashboard/resumen          → KPIs principales del día
GET    /api/dashboard/ventas-semana    → Ventas de los últimos 7 días
GET    /api/dashboard/citas-hoy        → Citas programadas para hoy
GET    /api/dashboard/alertas-stock    → Productos con stock mínimo
GET    /api/dashboard/pedidos-pendientes → Pedidos sin entregar
GET    /api/dashboard/retención        → Porcentaje de retención de pacientes
```

**KPIs a mostrar:**
- Total de ventas del día / semana / mes
- Número de citas hoy (por estado)
- Pacientes nuevos del mes
- Pedidos pendientes de entrega
- Alertas de stock mínimo
- Próximas citas (siguientes 3 horas)
- Ingresos vs egresos del día (resumen de caja)

**Interfaces existentes a migrar:** Dashboard principal si existe

**Componentes React:**
- `PaginaDashboard.tsx`
- `TarjetaKPI.tsx` → métrica numérica con tendencia
- `GraficoVentasSemana.tsx` → gráfico de barras (librería: recharts)
- `ListaCitasHoy.tsx` → próximas citas del día
- `PanelAlertasStock.tsx`
- `ResumenFinanciero.tsx`

---

### MÓDULO 15 — Reportes

**Objetivo:** Exportación de datos operativos en Excel y PDF.

**Endpoints a implementar:**
```
GET    /api/reportes/pacientes         → Reporte de pacientes (PDF/Excel)
GET    /api/reportes/ventas            → Reporte de ventas por período
GET    /api/reportes/compras           → Reporte de compras por período
GET    /api/reportes/inventario        → Reporte de inventario actual
GET    /api/reportes/citas             → Reporte de citas por período
GET    /api/reportes/caja              → Reporte de movimientos de caja
GET    /api/reportes/laboratorio       → Reporte de órdenes de laboratorio
```

Todos los endpoints aceptan query params: `?formato=pdf|excel&desde=YYYY-MM-DD&hasta=YYYY-MM-DD&sucursal=id`

**Componentes React:**
- `PaginaReportes.tsx`
- `GeneradorReporte.tsx` → formulario de selección de tipo, período, formato y sucursal
- `VistaPrevia.tsx` → tabla de datos antes de exportar

---

### MÓDULO 16 — Chatbot de Recepción

**Objetivo:** Asistir al personal de recepción en el agendamiento de citas y registro inicial de pacientes mediante conversación guiada.

**Arquitectura del chatbot:**
- El chatbot es un componente de React que mantiene el historial de conversación en estado local
- Envía mensajes al endpoint `/api/chatbot/mensaje`
- El backend interpreta la intención con lógica de reglas (para MVP) y llama a los servicios existentes
- Respuestas: texto libre + botones de acción rápida

**Intenciones manejadas (MVP):**
- `AGENDAR_CITA` → guiar por el flujo de crear una cita
- `CONSULTAR_HORARIO` → mostrar disponibilidad de optometristas
- `BUSCAR_PACIENTE` → buscar paciente por nombre o cédula
- `REGISTRAR_PACIENTE` → iniciar flujo de registro
- `CANCELAR_CITA` → buscar cita y cambiar estado
- `INFORMACION_GENERAL` → respuestas predefinidas sobre servicios

**Endpoints a implementar:**
```
POST   /api/chatbot/mensaje            → Procesar mensaje del chatbot
GET    /api/chatbot/sugerencias        → Sugerencias rápidas iniciales
```

**Componentes React:**
- `ChatbotWidget.tsx` → componente flotante (posición fija, bottom-right)
- `BurbujaMensaje.tsx` → mensaje del chatbot vs usuario
- `BotonesAccionRapida.tsx` → opciones sugeridas como chips clickeables
- `InterfazChatbot.tsx` → panel expandible con historial de conversación

**Criterios de aceptación:**
- ✓ El chatbot puede agendar una cita completa sin que el usuario salga de la pantalla
- ✓ Las respuestas del chatbot reflejan datos reales (horarios, pacientes existentes)
- ✓ El chatbot tiene un estado de "escribiendo..." durante la respuesta

---

### MÓDULO 17 — Configuración y Respaldos

**Tablas BD:** `configuraciones_respaldo`, `logs_sistema`

**Endpoints a implementar:**
```
GET    /api/configuracion/respaldos    → Obtener configuración actual
PUT    /api/configuracion/respaldos    → Actualizar configuración
POST   /api/configuracion/respaldos/ejecutar → Disparar respaldo manual
GET    /api/logs                       → Listar logs del sistema (con filtros)
```

**Componentes React:**
- `PaginaConfiguracion.tsx`
- `FormularioRespaldo.tsx` → hora de ejecución, frecuencia, ruta de destino
- `TablaLogs.tsx` → logs del sistema con filtros por módulo, usuario, fecha

---

## 9. Infraestructura y DevOps

### 9.1 Docker Compose

```yaml
# docker-compose.yml (producción/staging)
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: clinica_optometrica
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/basededatos.sql:/docker-entrypoint-initdb.d/01-schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/clinica_optometrica
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASS: ${EMAIL_PASS}
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 9.2 Variables de Entorno

```bash
# .env.example
# Base de datos
DB_USER=clinica_user
DB_PASSWORD=
DB_NAME=clinica_optometrica

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (para recuperación de contraseña)
EMAIL_HOST=smtp.ejemplo.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=no-reply@clinica.com

# Frontend
VITE_API_URL=http://localhost:3000/api
```

### 9.3 GitHub Actions

#### CI — `ci.yml` (en cada push y PR)
```
Pasos:
  1. Checkout del código
  2. Setup Node.js 24
  3. Instalar dependencias (backend y frontend)
  4. Verificar TypeScript sin errores (tsc --noEmit)
  5. Ejecutar linter (ESLint)
  6. Ejecutar pruebas unitarias (backend)
  7. Build de producción (frontend)
  8. Generar reporte de estado y publicar como comentario en el PR
```

#### Reporte por Commit — `reporte-commit.yml`
```
Trigger: push a cualquier rama
Genera:
  - Autor y fecha del commit
  - Rama utilizada
  - Lista de archivos modificados
  - Resumen de cambios (usando IA si está configurada)
  - Resultado de pruebas
  - Estado de compilación
  - Errores encontrados
Salida: archivo .md publicado como artefacto del workflow
```

---

## 10. Seguridad

### 10.1 Backend

- **Autenticación:** JWT con access token de corta duración (15 min) y refresh token en cookie HttpOnly SameSite=Strict
- **Contraseñas:** bcrypt con salt rounds 12
- **Prevención SQL Injection:** Usar exclusivamente consultas parametrizadas con `pg` (nunca concatenación de strings SQL)
- **Validación:** Zod en todos los endpoints, tanto para params/query como para body
- **Rate Limiting:** `express-rate-limit` — 100 req/min por IP general; 5 req/min en endpoints de autenticación
- **Headers de seguridad:** `helmet` para configurar CSP, HSTS, X-Frame-Options, etc.
- **CORS:** Configurado con allowlist de orígenes (no `*` en producción)
- **Variables de entorno:** Validadas al inicio con Zod — el servidor no arranca si faltan variables críticas
- **Manejo de errores:** Middleware centralizado que nunca expone stack traces en producción

### 10.2 Frontend

- **Tokens:** Access token en memoria de Zustand (no localStorage ni sessionStorage)
- **Refresh token:** En cookie HttpOnly (el frontend no tiene acceso directo a él)
- **Autorización de rutas:** Componente `RutaProtegida` valida rol y permiso antes de renderizar
- **Sanitización:** Sanitizar inputs antes de enviar al servidor; nunca usar `dangerouslySetInnerHTML`
- **Variables de entorno:** Solo variables con prefijo `VITE_` (públicas); nunca secrets en el frontend

### 10.3 Autorización por Roles

| Módulo | Administrador | Recepcionista | Optometrista | Cajero | Vendedor |
|--------|:---:|:---:|:---:|:---:|:---:|
| Usuarios y Roles | ✅ CRUD | - | - | - | - |
| Sucursales | ✅ CRUD | - | - | - | - |
| Pacientes | ✅ CRUD | ✅ CRUD | ✅ Lectura | - | ✅ Lectura |
| Citas | ✅ CRUD | ✅ CRUD | ✅ CRUD | - | - |
| Expedientes | ✅ Lectura | ✅ Lectura | ✅ CRUD | - | - |
| Productos | ✅ CRUD | - | ✅ Lectura | - | ✅ Lectura |
| Inventario | ✅ CRUD | - | - | - | ✅ Lectura |
| Lentes Clínicos | ✅ CRUD | - | ✅ CRUD | - | - |
| Lab. y Calidad | ✅ CRUD | - | ✅ CRUD | - | - |
| Ventas | ✅ CRUD | ✅ CRUD | - | ✅ CRUD | ✅ CRUD |
| Compras | ✅ CRUD | - | - | - | - |
| Caja | ✅ CRUD | - | - | ✅ CRUD | - |
| Promociones | ✅ CRUD | - | - | ✅ Lectura | ✅ Lectura |
| Dashboard | ✅ Completo | ✅ Básico | ✅ Clínico | ✅ Financiero | ✅ Ventas |
| Reportes | ✅ Todos | ✅ Limitado | ✅ Clínicos | ✅ Financieros | ✅ Ventas |

---

## 11. Hoja de Ruta por Sprints

Cada sprint tiene una duración de **2 semanas**.

---

### SPRINT 0 — Fundamentos (Semanas 1–2)

**Objetivo:** Dejar lista la infraestructura base para que todos puedan desarrollar en paralelo.

**Backend:**
- [ ] Inicializar proyecto Node.js 24 + TypeScript + Express
- [ ] Configurar conexión a PostgreSQL con pool de `pg`
- [ ] Middleware: manejo de errores, logger, validación con Zod
- [ ] Estructura de respuestas estándar
- [ ] Ejecutar `basededatos.sql` y verificar todos los triggers
- [ ] Aplicar correcciones DB-01 y DB-06 y DB-09
- [ ] Script de verificación de integridad de la BD

**Frontend:**
- [ ] Inicializar proyecto React 19 + Vite 8 + TypeScript
- [ ] Configurar Tailwind 4 con todos los tokens del design system
- [ ] Instalar dependencias: TanStack Query, Zustand, React Router 6, Sonner
- [ ] Importar fuentes Manrope e Inter
- [ ] Crear los 10 componentes base (Boton, Campo, Tarjeta, Modal, Tabla, Insignia, CargadorIris, Notificacion, BarraLateral, BarraSuperior)
- [ ] Configurar cliente HTTP con interceptores JWT
- [ ] Configurar rutas base del router (público/protegido)
- [ ] Migrar e integrar interfaces HTML existentes identificadas como componentes base

**Infraestructura:**
- [ ] `docker-compose.yml` funcional con los 3 servicios (frontend, backend, db)
- [ ] `docker-compose.dev.yml` con hot-reload
- [ ] `.env.example` completo
- [ ] `README.md` con instrucciones de inicio
- [ ] Workflow de GitHub Actions CI básico

**Criterio de finalización:** `docker compose up -d` levanta el sistema completo; el frontend muestra la pantalla de login; el backend responde en `/api/health`.

---

### SPRINT 1 — Autenticación + Usuarios + Sucursales (Semanas 3–4)

**Objetivo:** El sistema tiene control de acceso funcional.

**Backend:**
- [ ] Módulo `autenticacion`: login, logout, refresh token, recuperación de contraseña
- [ ] Módulo `usuarios`: CRUD completo con gestión de roles y permisos
- [ ] Módulo `sucursales`: CRUD básico
- [ ] Módulo `empleados`: CRUD básico
- [ ] Middleware de autenticación y autorización por rol
- [ ] Integración con nodemailer para emails de recuperación

**Frontend:**
- [ ] `PaginaLogin.tsx` → migrar interfaz existente
- [ ] `FormularioRecuperacion.tsx`
- [ ] `FormularioRestablecimiento.tsx`
- [ ] `PaginaUsuarios.tsx` + `FormularioUsuario.tsx`
- [ ] `PaginaSucursales.tsx` + `FormularioSucursal.tsx`
- [ ] `hooks/useAuth.ts` con Zustand
- [ ] `hooks/usePermisos.ts`
- [ ] Barra lateral con navegación según rol del usuario autenticado

**Criterio de finalización:** Un administrador puede crear usuarios, asignar roles, y cada rol solo ve las opciones de menú que le corresponden.

---

### SPRINT 2 — Pacientes y Citas (Semanas 5–6)

**Objetivo:** La recepcionista puede registrar pacientes y agendar citas.

**Backend:**
- [ ] Módulo `pacientes`: CRUD con búsqueda
- [ ] Módulo `empresas`: CRUD
- [ ] Módulo `citas`: CRUD + cambio de estados + disponibilidad
- [ ] Módulo `horarios-disponibles`: CRUD

**Frontend:**
- [ ] `PaginaPacientes.tsx` → migrar interfaz existente
- [ ] `TablaPacientes.tsx` con búsqueda en tiempo real
- [ ] `FormularioPaciente.tsx`
- [ ] `TarjetaPaciente.tsx` (quickview)
- [ ] `PaginaCitas.tsx` → migrar interfaz existente (calendario/agenda)
- [ ] `CalendarioCitas.tsx`
- [ ] `FormularioCita.tsx` con selector de horario disponible
- [ ] `TarjetaCita.tsx` con cambio de estado

**Criterio de finalización:** La recepcionista puede registrar un paciente nuevo, agendar una cita y verla en el calendario. Puede cancelarla y reprogramarla.

---

### SPRINT 3 — Expedientes Clínicos y Recetas (Semanas 7–8)

**Objetivo:** El optometrista puede registrar la consulta completa y emitir recetas.

**Backend:**
- [ ] Módulo `expedientes`: crear historia visual, registrar consulta
- [ ] Módulo `lensometrias-clinicas`: CRUD
- [ ] Módulo `recetas`: crear receta, exportar PDF

**Frontend:**
- [ ] `PaginaExpediente.tsx` → migrar interfaz existente
- [ ] `TimelineConsultas.tsx`
- [ ] `FormularioConsulta.tsx`
- [ ] `FormularioReceta.tsx`
- [ ] `TarjetaReceta.tsx` con exportación PDF
- [ ] `ChipAgudezaVisual.tsx`

**Criterio de finalización:** El optometrista puede abrir el expediente de un paciente, registrar la lensometría del paciente actual, anotar observaciones y emitir una receta que se puede descargar en PDF.

---

### SPRINT 4 — Productos, Lentes Clínicos e Inventario (Semanas 9–10)

**Objetivo:** El sistema gestiona el catálogo completo de productos y el stock.

**Backend:**
- [ ] Módulo `productos`: CRUD de productos, marcos, gafas, accesorios
- [ ] Módulo `tipos-lente`, `materiales-lente`, `filtros-lente`: CRUD
- [ ] Módulo `lentes-clinicos`: configurador + cálculo de precio
- [ ] Módulo `inventario`: stock por sucursal, movimientos, alertas, transferencias

**Frontend:**
- [ ] `PaginaProductos.tsx` → migrar interfaz existente
- [ ] `FormularioProducto.tsx` dinámico
- [ ] `ConfiguradorLente.tsx` (wizard)
- [ ] `PaginaInventario.tsx` → migrar interfaz existente
- [ ] `TablaInventario.tsx` con indicadores de stock
- [ ] `AlertasStock.tsx`
- [ ] `PaginaConfiguracion.tsx` (admin de tipos, materiales, filtros)

**Criterio de finalización:** Se puede registrar una montura, configurar un lente clínico personalizado con su precio calculado automáticamente, y ver el inventario actual con alertas de stock mínimo.

---

### SPRINT 5 — Ventas, Pedidos y Compras (Semanas 11–12)

**Objetivo:** El sistema procesa ventas y compras completas.

**Backend:**
- [ ] Módulo `ventas`: CRUD de ventas, detalles, pagos
- [ ] Módulo `pedidos`: CRUD de pedidos clínicos
- [ ] Módulo `proveedores`: CRUD
- [ ] Módulo `compras`: CRUD de compras y detalles
- [ ] Módulo `metodos-pago`: CRUD

**Frontend:**
- [ ] `PuntoVenta.tsx` → migrar interfaz existente
- [ ] `CarritoVenta.tsx`
- [ ] `FormularioPago.tsx`
- [ ] `ComprobanteVenta.tsx`
- [ ] `PaginaPedidos.tsx`
- [ ] `PaginaProveedores.tsx`
- [ ] `FormularioCompra.tsx`

**Criterio de finalización:** Un vendedor puede crear una venta, agregar productos o lentes clínicos, aplicar un descuento, registrar el pago y obtener el comprobante. Una compra actualiza el inventario automáticamente.

---

### SPRINT 6 — Caja, Órdenes de Laboratorio y Promociones (Semanas 13–14)

**Objetivo:** Los procesos de caja y control de calidad están operativos.

**Backend:**
- [ ] Módulo `caja`: apertura, cierre, movimientos, pérdidas
- [ ] Módulo `ordenes-laboratorio`: CRUD, estados, lensometría recibida, evaluación
- [ ] Módulo `promociones` y `descuentos`: CRUD

**Frontend:**
- [ ] `PaginaCaja.tsx` + `FormularioApertura.tsx` + `FormularioCierre.tsx`
- [ ] `PaginaOrdenesLaboratorio.tsx` + `FormularioLensometriaRecibida.tsx` + `ResultadoEvaluacion.tsx`
- [ ] `PaginaPromociones.tsx` + formularios

**Criterio de finalización:** El cajero puede abrir/cerrar caja y ver el resumen financiero del día. El optometrista puede crear una orden de laboratorio y registrar el resultado de calidad del lente recibido.

---

### SPRINT 7 — Dashboard, Reportes y Chatbot (Semanas 15–16)

**Objetivo:** El sistema ofrece visibilidad ejecutiva y el chatbot está funcional.

**Backend:**
- [ ] Módulo `dashboard`: endpoints de KPIs y estadísticas
- [ ] Módulo `reportes`: generación de Excel (exceljs) y PDF (pdfkit)
- [ ] Módulo `chatbot`: procesamiento de intenciones y respuestas
- [ ] Módulo `configuracion`: respaldos y logs

**Frontend:**
- [ ] `PaginaDashboard.tsx` → migrar interfaz existente
- [ ] `TarjetaKPI.tsx`, `GraficoVentasSemana.tsx`, etc.
- [ ] `PaginaReportes.tsx` + `GeneradorReporte.tsx`
- [ ] `ChatbotWidget.tsx` (componente flotante)
- [ ] `PaginaConfiguracion.tsx` (respaldos + logs)

**Criterio de finalización:** El administrador ve el dashboard con KPIs reales. Puede generar y descargar cualquier reporte en Excel o PDF. El chatbot puede agendar una cita desde la pantalla principal.

---

### SPRINT 8 — Pruebas, Pulido y Despliegue (Semanas 17–18)

**Objetivo:** El sistema está listo para producción.

**Tareas:**
- [ ] Pruebas de integración de todos los flujos críticos
- [ ] Pruebas de seguridad (verificar bloqueo de intentos, expiración de tokens, validación de permisos)
- [ ] Revisión de rendimiento con datos de prueba (al menos 1000 pacientes, 5000 ventas)
- [ ] Validar que todos los triggers de la BD funcionan correctamente bajo carga
- [ ] Revisión del design system — verificar consistencia visual en todos los módulos
- [ ] Accesibilidad básica (ARIA labels, contraste de colores)
- [ ] Optimización de queries lentas identificadas con `EXPLAIN ANALYZE`
- [ ] Configurar GitHub Actions CD para despliegue automático
- [ ] Documentar el sistema (`README.md` completo, documentación de API)
- [ ] Pruebas en dispositivos móviles (responsividad)
- [ ] Revisión final de seguridad

**Criterio de finalización:** El sistema pasa todas las pruebas y puede iniciarse en producción con `docker compose up -d`.

---

## 12. Estándares y Convenciones

### 12.1 Código

| Aspecto | Estándar |
|---------|----------|
| Idioma del código | Español (comentarios, nombres de variables, funciones, componentes) |
| Idioma de la interfaz | Español |
| Nombrado de tablas | `snake_case`, plural |
| Nombrado de columnas | `snake_case` |
| Variables y funciones | `camelCase` |
| Interfaces y tipos | `PascalCase` |
| Componentes React | `PascalCase.tsx` |
| Carpetas y archivos no-componentes | `kebab-case` |
| Commits | `feat: descripción`, `fix: descripción`, `chore: descripción` (Conventional Commits) |
| Tamaño máximo de función | 40 líneas (refactorizar si supera) |
| Comentarios | Obligatorios en lógica de negocio compleja; en español |

### 12.2 TypeScript

- `strict: true` en todo el proyecto
- Prohibido el uso de `any` — usar `unknown` si el tipo es desconocido
- Preferir tipos sobre interfaces para objetos simples; interfaces para contratos
- Toda función de servicio debe tener tipo de retorno explícito

### 12.3 Testing

- Pruebas unitarias para toda lógica de negocio en servicios del backend
- Pruebas de integración para flujos críticos (login, crear venta, emitir receta)
- Cobertura mínima objetivo: 60% en backend
- Framework: Jest + Supertest para backend

### 12.4 Documentación de Commits y Reportes

Los reportes automáticos por commit (GitHub Actions) incluirán:
- Autor, fecha, rama, hash del commit
- Archivos modificados con tipo de cambio (agregado/modificado/eliminado)
- Resultado de pruebas (pasó/falló, número de tests)
- Estado de compilación (TypeScript, build)
- Errores encontrados (si aplica)
- Artefactos generados (si aplica)

---

## 13. Riesgos y Mitigaciones

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|:---:|:---:|------------|
| R-01 | Interfaces HTML/CSS existentes con mucho CSS personalizado difícil de tokenizar | Media | Media | Revisar todas las interfaces en Sprint 0 y evaluar si es más eficiente migrar o reconstruir |
| R-02 | Trigger DB-01 (total venta negativo) en producción bajo descuentos altos | Baja | Alta | Aplicar fix en Sprint 0 antes de cualquier desarrollo de ventas |
| R-03 | Rendimiento del dashboard con muchas consultas agregadas | Media | Media | Implementar con TanStack Query cache (staleTime 5 min); si hay problemas, agregar vistas materializadas en BD |
| R-04 | Email de recuperación de contraseña no entregado (spam) | Media | Media | Configurar SPF/DKIM en el dominio; usar servicio como SendGrid o Amazon SES |
| R-05 | El módulo chatbot tarda más de lo estimado | Media | Baja | Priorizar la lógica de intenciones básica (agendar cita, consultar horario); funcionalidades avanzadas en Sprint 8 o siguiente iteración |
| R-06 | TypeScript 6.0.x puede tener cambios de API respecto a versiones anteriores | Baja | Media | Revisar changelog al inicio del proyecto; los tipos son más estrictos en v6 |
| R-07 | Vite 8.x aún en versión reciente — posibles incompatibilidades con librerías | Baja | Baja | Verificar compatibilidad de TanStack Query, React Router y Sonner con Vite 8 en Sprint 0 |
| R-08 | Falta de definición exacta de permisos granulares por módulo | Alta | Media | El plan incluye la matriz de permisos (sección 10.3) como punto de partida; validar con el cliente en Sprint 1 |
| R-09 | Las interfaces existentes usan CSS incompatible con el design system | Media | Media | Establecer proceso de tokenización definido en sección 7.1; no mezclar estilos legacy con el design system |

---

## Apéndice A — Checklist de Inicio de Proyecto

Antes de escribir la primera línea de código de implementación, verificar que:

- [ ] Todos los miembros del equipo han leído y validado este documento
- [ ] Se ha creado el repositorio en GitHub con la estructura de ramas definida
- [ ] Se ha configurado el repositorio con las GitHub Actions del Sprint 0
- [ ] Las variables de entorno están definidas (`.env` local para desarrollo)
- [ ] La base de datos se levanta correctamente con Docker y el script SQL
- [ ] Se han aplicado las correcciones DB-01, DB-06 y DB-09
- [ ] El equipo ha revisado el design system "The Clinical Ethereal" y está alineado
- [ ] Se ha inventariado la lista completa de interfaces HTML/CSS existentes
- [ ] Se ha asignado cada interfaz existente a su módulo y sprint correspondiente
- [ ] Los criterios de aceptación de Sprint 0 son comprensibles para todo el equipo

---

## Apéndice B — Inventario de Interfaces Existentes

*(Este inventario debe completarse en Sprint 0 revisando los archivos HTML/CSS disponibles)*

| # | Archivo HTML/CSS | Módulo Asignado | Sprint | Decisión |
|---|-----------------|-----------------|--------|----------|
| 1 | Por identificar | - | 0 | Migrar / Reconstruir |
| 2 | Por identificar | - | - | - |
| ... | ... | ... | ... | ... |

**Acción:** En la primera semana del Sprint 0, un miembro del equipo debe catalogar todos los archivos HTML/CSS existentes, tomar capturas de pantalla y llenar esta tabla. Esto determinará el alcance real de la migración.

---

*Documento elaborado como guía técnica maestra del proyecto. Sujeto a revisión al inicio de cada sprint según hallazgos durante la implementación.*
