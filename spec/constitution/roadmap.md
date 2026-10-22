# Roadmap

## Lo que ya está implementado

**Backend**
- [x] Autenticación (login, logout, refresh, verificar, recuperar/restablecer contraseña)
- [x] Usuarios (CRUD, roles, permisos, empleados)
- [x] Sucursales (CRUD, activar/desactivar)
- [x] Pacientes / Clientes (CRUD, búsqueda)
- [x] Empresas (CRUD, búsqueda)
- [x] Citas (CRUD, disponibilidad, horarios, cambio estado)
- [x] Inventario / Productos (catálogo, stock por sucursal, unidades serializadas, movimientos, alerta de stock mínimo)
- [x] Compras y Proveedores (órdenes de compra, recepción, ingreso a inventario)
- [x] Caja (cajas, aperturas, movimientos, cierres, resumen)
- [x] Auditoría (logs del sistema)
- [x] Ventas (POS: carrito, pago único, comprobante, historial, cancelación con reversión de inventario)

**Frontend**
- [x] Inicio de sesión / Recuperar / Restablecer contraseña
- [x] Citas (CRUD completo)
- [x] Pacientes (CRUD + búsqueda + quickview)
- [x] Empresas (CRUD + búsqueda)
- [x] Sucursales (CRUD + toggle estado)
- [x] Usuarios (CRUD + toggle/bloqueo)
- [x] Inventario (tabla + tarjetas + modal de ingreso, productos granel/serializados)
- [x] Compras (listado + modal de nueva compra)
- [x] Caja (selector, apertura, movimientos, cierre)
- [x] Auditoría (visor de logs)
- [x] Ventas (POS con pestañas Punto de venta / Historial, modal de pago y comprobante)

## Lo que no está implementado

**Backend**
- [ ] Lentes Clínicos (tipos, materiales, filtros, configurador)
- [ ] Órdenes de Laboratorio + Control de Calidad
- [ ] Expedientes Clínicos (historias_visuales, consultas, recetas, lensometrías)
- [ ] Promociones y Descuentos
- [x] Reportes (ventas, compras, citas e inventario; CSV/PDF; solo Administrador)
- [ ] Dashboard (KPIs, exportación)
- [ ] Configuración y Respaldos

**Frontend**
- [ ] Dashboard (vista real con KPIs) — actualmente stub `PaginaDashboard.tsx`
- [ ] Historias Clínicas (expedientes) — actualmente stub `PaginaExpedientes.tsx`
- [ ] Lentes Clínicos (configurador)
- [ ] Órdenes de Laboratorio
- [x] Reportes (ventas, compras, citas e inventario; gráficas y CSV/PDF)
- [ ] Configuración

**Pendiente de refinamiento (implementado a medias)**
- [ ] Inventario: editar / desactivar productos, ajuste y transferencia de stock entre sucursales
- [ ] Compras: detalle de compra y recepción completa desde la UI

**Interfaces HTML legacy por migrar**
- [ ] `interfaces/ventas.html` (ya tiene equivalente React; pendiente retirar el HTML)
- [ ] `interfaces/dashboard.html`
- [ ] `interfaces/historias-clinicas.html`
- [ ] `interfaces/citas.html` (ya tiene equivalente React; pendiente retirar el HTML)
- [ ] `interfaces/inventario.html` (ya tiene equivalente React; pendiente retirar el HTML)
