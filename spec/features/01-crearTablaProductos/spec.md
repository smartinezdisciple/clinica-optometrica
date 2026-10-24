# Especificación: Tabla de Productos (Inventario)

## Propósito

Construir un componente de tabla que liste todos los productos de la clínica
optométrica cuyo tipo sea **marco oftalmológico**, **gafas de sol** o **accesorio**,
excluyendo lentes comerciales y productos inactivos.

## Columnas

| # | Columna        | Fuente de datos                                           |
|---|----------------|-----------------------------------------------------------|
| 1 | **#**          | Número correlativo (índice + 1)                           |
| 2 | **Nombre**         | `productos.nombre_producto`                            |
| 3 | **Categoría**      | `productos.tipo_producto` → mapeo amigable             |
| 4 | **Cantidad**       | `inventario_sucursal.cantidad` (stock en sucursal del usuario) |
| 5 | **Ingresado por**  | Nombre del usuario que registró la última entrada       |
| 6 | **Fecha**          | Fecha del último movimiento de entrada                  |
| 7 | **Precio**         | `productos.precio_venta` (formato moneda)               |
| 8 | **Marca**          | `marcos_oftalmologicos.marca`; `—` para gafas sol y accesorios |

## Comportamiento

- Endpoint: `GET /api/inventario/productos` (backend a implementar).
- Integrada en `PaginaInventario.tsx` dentro de `<Tarjeta>`.
- Vacío: *"No se encontraron productos en el inventario."*
- Loading: `<CargadorIris />`.
- Usa el componente `<Tabla>` de `@/components/ui/Tabla`.
