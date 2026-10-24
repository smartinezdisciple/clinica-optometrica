# Especificación: Modal de Ingreso de Productos

## Propósito

Modal para registrar la entrada (ingreso) de productos al inventario. Permite
seleccionar un producto existente, especificar la cantidad ingresada, el precio
de compra y una observación opcional.

## Comportamiento

- Se abre desde un botón "Ingresar stock" en `PaginaInventario`.
- Formulario con campos: producto (selector), cantidad, precio compra, observación.
- Al guardar: crea un movimiento de tipo `entrada` en `movimientos_inventario`
  y actualiza el stock en `inventario_sucursal`.
- Usa el componente `<Modal>` de `@/components/ui/Modal`.
- Endpoint: `POST /api/inventario/movimientos`.
