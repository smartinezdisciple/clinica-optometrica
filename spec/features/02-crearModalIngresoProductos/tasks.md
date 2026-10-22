# Tasks — Modal de Ingreso de Productos

## Backend

- [ ] Agregar método `crearMovimiento` en repository (INSERT + UPDATE en transacción)
- [ ] Agregar `registrarMovimiento` en service con validaciones
- [ ] Agregar handler `registrarMovimiento` en controller
- [ ] Agregar ruta `POST /api/inventario/movimientos` en routes

## Frontend

- [ ] Agregar estado `modalIngresoAbierto` en PaginaInventario
- [ ] Crear formulario de ingreso dentro de `<Modal>`
- [ ] Agregar `useMutation` para POST
- [ ] Conectar botón "Ingresar stock"
- [ ] Invalidar query de productos al success

## Validación

- [ ] `npm run dev` — sin errores
- [ ] `npm run lint`
- [ ] `npm run build`
