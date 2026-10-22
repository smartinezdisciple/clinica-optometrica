# Plan: Modal de Ingreso de Productos

## Fase 1 — Backend: endpoint POST

1. Agregar `registrarMovimiento` en `inventario.controller.ts`.
2. En repository: transacción que inserta en `movimientos_inventario` y
   actualiza `inventario_sucursal.cantidad`.

## Fase 2 — Frontend: modal en PaginaInventario

1. Agregar estado `modalIngresoAbierto`.
2. Crear formulario con `<Campo>`, `<SelectorBusqueda>` para producto.
3. `useMutation` para enviar datos.
4. Invalidar query de productos al guardar.
