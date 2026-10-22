# Especificación: Tarjeta de Producto

## Propósito

Componente que muestra la información resumida de un producto individual en
formato tarjeta (card), diseñado para una vista de cuadrícula alternativa a la
tabla en la página de inventario.

## Comportamiento

- Muestra: nombre, categoría (con ícono/color), cantidad en stock, precio y marca.
- Botón "Ingresar stock" y "Ajustar stock" por tarjeta.
- Usa el componente `<Tarjeta>` de `@/components/ui/Tarjeta`.
- Diseño responsive: 1 columna en mobile, 2 en tablet, 3+ en desktop.
- Cada tarjeta es clickeable para ver detalle del producto.
