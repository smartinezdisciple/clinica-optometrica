# Plan: Tarjeta de Producto

## Fase 1 — Componente TarjetaProducto

1. Crear `frontend/src/features/inventario/components/TarjetaProducto.tsx`.
2. Props: `producto: ProductoInventario`.
3. Render: ícono según categoría, nombre, stock, precio, marca, botones de acción.

## Fase 2 — Vista cuadrícula en PaginaInventario

1. Agregar toggle tabla/cuadrícula en PaginaInventario.
2. Renderizar grid de `<TarjetaProducto>` en vista cuadrícula.
3. Compartir datos con la vista de tabla (mismo `useQuery`).
