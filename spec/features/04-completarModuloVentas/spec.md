# Especificación: Módulo de Ventas (POS)

## Propósito

Completar el módulo de ventas reemplazando el stub actual `frontend/src/features/ventas/pages/PaginaVentas.tsx`.
El POS permite al vendedor armar una venta a partir del catálogo de productos, asociar un cliente,
aplicar un descuento, cobrar con uno o varios métodos de pago y emitir un comprobante; además de
consultar el historial de ventas. Es la migración a React de `interfaces/ventas.html`.

## Alcance

### Pestaña "Punto de Venta"
- **Grid de productos vendibles**: solo `productos.activo = TRUE` con `tipo_producto` en
  `marco_oftalmologico`, `gafas_sol`, `accesorio`, `lente_comercial` y con stock disponible en la
  sucursal del usuario.
- **Búsqueda** por nombre, código (`codigo_producto`) o categoría.
- **Filtros por categoría** (chips): Todos, Marcos, Gafas de sol, Accesorios, Lentes.
- **Selección de cliente**: buscador por nombre o cédula sobre `clientes` (Persona y Empresa).
  - Una venta exige `id_cliente` (columna `NOT NULL`). Debe poder seleccionarse antes de cobrar.
- **Carrito**: agregar producto, quitar, incrementar/decrementar cantidad.
  - Si el producto es `tipo_manejo = 'serializado'`, se debe elegir una `unidad_serializada`
    con estado `disponible` de la sucursal.
  - Validar stock disponible antes de agregar/incrementar.
- **Descuento**: porcentaje (0–100) aplicado sobre el subtotal.
- **Nota / referencia** de la venta.
- **Totales**: subtotal, descuento, impuesto (si aplica) y total.
- Botón **Cobrar** habilitado solo con cliente seleccionado y carrito no vacío.

### Modal de pago
- Muestra total, cliente e ítems.
- **Métodos de pago** obtenidos de `metodos_pago WHERE activo = TRUE`, agrupados por
  `tipo_metodo_pago` (fisico / electronico / digital).
- Si el método es **efectivo**: campo "monto recibido" y cálculo de **cambio** en vivo.
- Botón confirmar → crea la venta finalizada con su `pago`.
  - Nota: el esquema vincula **un solo pago por venta** (`ventas.id_pago`), por lo que el
    pago mixto (varios métodos) queda fuera de alcance de esta iteración.

### Modal de comprobante (ticket)
- Nº de orden (`id_venta` formateado), cliente, método(s) de pago, fecha/hora, ítems, total y cambio.
- Botón **Imprimir** (`window.print`).

### Pestaña "Historial"
- Tabla de ventas (`ventas`) con: Nº, fecha, cliente, ítems, total, estado.
- **Filtro por estado** (`en_proceso`, `finalizada`, `cancelada`) y búsqueda por Nº de orden.
- **KPIs**: total vendido y número de ventas del período.
- **Ver detalle** de una venta (modal) con sus `detalles_venta` y pago.
- Acción **Cancelar** venta (cambia `estado_venta` a `cancelada`).

## Modelo de datos (ver `basedatos.sql`, Módulo 11)

| Tabla | Uso en la feature |
|---|---|
| `ventas` | Cabecera de la venta (`id_cliente`, `id_empleado`, `id_pago`, `descuento_aplicado`, `estado_venta`) |
| `detalles_venta` | Líneas (`id_producto` o `id_lente_clinico`, `id_unidad_serializada`, `cantidad`, `precio_unitario`) |
| `pagos` / `metodos_pago` | Cobro y métodos disponibles |
| `unidades_serializadas` | Se marca `vendido` + `fecha_venta` al vender un serializado |
| `inventario_sucursal` / `movimientos_inventario` | Se actualizan **por trigger** (no desde la app) |
| `movimientos_financieros` | Ingreso ligado a `id_venta` cuando hay una caja abierta |
| `clientes` | Selección de cliente (Persona / Empresa) |
| `empleados` / `usuarios` | `ventas.id_empleado` se resuelve desde el usuario autenticado |

## Triggers existentes que la app NO debe duplicar

- `tg_restar_inventario_venta` — al insertar un `detalle_venta`, descuenta `inventario_sucursal` y
  registra un `movimiento_inventario` de tipo `salida`.
- `tg_calcular_totales_venta` — recalcula `ventas.subtotal` y `ventas.total_venta`
  (aplicando `descuento_aplicado`) al insertar/actualizar/borrar detalles.

> La app **solo** inserta `detalles_venta`; el stock y los totales se calculan en la base de datos.
> El descuento debe persistirse en `ventas.descuento_aplicado` **antes** de insertar los detalles.

## Fuera de alcance (iteración futura)

- Lentes clínicos personalizados (`id_lente_clinico`) y `pedidos` para lentes en laboratorio.
- Promociones y `descuentos` automáticos de catálogo (esta iteración solo descuento manual %).
- Pago mixto (varios métodos) — el esquema soporta un pago por venta.
- Impuestos formales / facturación electrónica.
- Devoluciones y notas de crédito.

## Convenciones

- Backend: capas controller → service → repository en `backend/src/modules/ventas/`.
- Frontend: feature aislada en `frontend/src/features/ventas/` (pages + components + types).
- Componentes UI existentes: `Boton`, `Campo`, `Modal`, `Tarjeta`, `Tabla`, `Insignia`,
  `CargadorIris`, `SelectorBusqueda`, `BarraBusqueda` (`@/components/ui/*`).
- Imports del frontend con alias `@/*`.
- Endpoints bajo `/api/ventas` (autenticados) y registrados en `backend/src/app.ts`.
