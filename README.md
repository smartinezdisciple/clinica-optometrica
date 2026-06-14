# Sistema Web para Clínica Optométrica

Este es el repositorio del **Sistema Web para Clínica Optométrica**, una aplicación diseñada para gestionar de forma eficiente el flujo de trabajo clínico y comercial de una óptica.

## 📋 Módulos del Sistema
El sistema cuenta con las siguientes interfaces e integraciones:
- **Tablero (Dashboard):** Métricas clave, gráficos de ventas, recordatorios de citas, alertas de stock mínimo y feed de actividad reciente.
- **Ventas (POS):** Búsqueda de productos, carrito de compras, gestión de clientes y pasarela de pago simulada.
- **Citas:** Agenda interactiva, asignación de horarios de médicos, control de estados de citas (agendada, en curso, finalizada, cancelada).
- **Inventario:** Control de existencias, clasificación por categorías (marcos, gafas, lentes clínicos, accesorios) y alertas de stock.
- **Historias Clínicas:** Expediente digital del paciente, refracciones y recetas, y lensometrías.

## 🎨 Sistema de Diseño: "The Clinical Ethereal"
El diseño de la aplicación está basado en una estética moderna, limpia y profesional, optimizada para entornos médicos.
- **Colores Principales:** 
  - Primario: `#00658d` (Azul Clínico)
  - Contenedor Primario: `#00aeef` (Celeste Brillante)
  - Fondo de Superficie: `#f7f9fb` (Gris Ultra Claro)
- **Efectos:** Glassmorphism (paneles translúcidos con desenfoque de fondo), bordes redondeados (`rounded-xl` y `rounded-2xl`), y sombras suaves.
- **Tipografía:** *Manrope* para encabezados y *Inter* para el cuerpo de texto.

## 🗄️ Base de Datos
El esquema de la base de datos se encuentra documentado e implementado en PostgreSQL en el archivo [basedatos.sql](basedatos.sql). Incluye:
- **37 Tablas** estructuradas en `snake_case`.
- **13 Triggers** para automatizar procesos clave (ej. control de stock, cálculo de precios de lentes, bloqueo de cuentas).
- **Índices** optimizados para búsquedas rápidas.

## 🚀 Tecnologías
- **Frontend:** HTML5, JavaScript Vanilla, CSS3.
- **Estilos:** Tailwind CSS (a través de CDN con configuración personalizada de tokens).
- **Base de Datos:** PostgreSQL v2.0.
