import { pool } from '../../config/database'
import type {
  DashboardKpisDb,
  VentaMensualDb,
  CitaProximaDb,
  StockBajoDb,
  ActividadRecienteDb,
  EficienciaClinicaDb,
} from './dashboard.types'

export async function getDashboardKpis(): Promise<DashboardKpisDb> {
  const sql = `
    WITH hoy AS (
      SELECT CURRENT_DATE AS d
    )
    SELECT
      COALESCE((SELECT SUM(v.total_venta) FROM ventas v, hoy WHERE v.estado_venta = 'finalizada' AND v.fecha_venta = hoy.d), 0) AS ventas_hoy_monto,
      COALESCE((SELECT COUNT(*) FROM ventas v, hoy WHERE v.estado_venta = 'finalizada' AND v.fecha_venta = hoy.d), 0) AS ventas_hoy_cantidad,
      COALESCE((SELECT COUNT(*) FROM citas c, hoy WHERE DATE(c.fecha_hora_cita) = hoy.d), 0) AS citas_hoy_total,
      COALESCE((SELECT COUNT(*) FROM citas c, hoy WHERE DATE(c.fecha_hora_cita) = hoy.d AND c.estado_cita = 'completada'), 0) AS citas_hoy_completadas,
      COALESCE((SELECT COUNT(*) FROM pacientes p JOIN clientes cl ON cl.id_cliente = p.id_cliente WHERE DATE(cl.fecha_registro) >= date_trunc('month', CURRENT_DATE) AND DATE(cl.fecha_registro) < date_trunc('month', CURRENT_DATE) + interval '1 month'), 0) AS pacientes_nuevos_mes,
      COALESCE((SELECT COUNT(*) FROM inventario_sucursal inv WHERE inv.cantidad <= inv.stock_minimo), 0) AS stock_bajo_count
  `
  const { rows } = await pool.query<DashboardKpisDb>(sql)
  return rows[0]
}

export async function getVentasMensuales(): Promise<VentaMensualDb[]> {
  const sql = `
    SELECT
      TO_CHAR(fecha_venta, 'TMMonth') AS mes,
      EXTRACT(YEAR FROM fecha_venta)::int AS anio,
      COALESCE(SUM(total_venta), 0) AS total_monto,
      COUNT(*) AS total_ventas
    FROM ventas
    WHERE estado_venta = 'finalizada'
      AND fecha_venta >= date_trunc('year', CURRENT_DATE)
      AND fecha_venta < date_trunc('year', CURRENT_DATE) + interval '1 year'
    GROUP BY TO_CHAR(fecha_venta, 'TMMonth'), EXTRACT(YEAR FROM fecha_venta), EXTRACT(MONTH FROM fecha_venta)
    ORDER BY EXTRACT(MONTH FROM fecha_venta)
  `
  const { rows } = await pool.query<VentaMensualDb>(sql)
  return rows
}

export async function getProximasCitas(): Promise<CitaProximaDb[]> {
  const sql = `
    SELECT
      c.id_cita,
      c.fecha_hora_cita,
      c.motivo_cita,
      c.estado_cita,
      cl.nombres AS paciente_nombre,
      cl.apellidos AS paciente_apellido,
      cl.cedula AS paciente_cedula,
      e.nombres AS empleado_nombre,
      e.apellidos AS empleado_apellido
    FROM citas c
    JOIN pacientes p ON p.id_cliente = c.id_cliente
    JOIN clientes cl ON cl.id_cliente = p.id_cliente
    LEFT JOIN empleados e ON e.id_empleado = c.id_empleado
    WHERE c.fecha_hora_cita >= CURRENT_TIMESTAMP
      AND c.estado_cita IN ('confirmada', 'en_espera_confirmacion', 'reprogramada')
    ORDER BY c.fecha_hora_cita ASC
    LIMIT 10
  `
  const { rows } = await pool.query<CitaProximaDb>(sql)
  return rows
}

export async function getStockBajo(): Promise<StockBajoDb[]> {
  const sql = `
    SELECT
      pr.id_producto,
      pr.nombre_producto,
      pr.tipo_producto,
      inv.cantidad,
      inv.stock_minimo,
      s.nombre AS sucursal_nombre
    FROM inventario_sucursal inv
    JOIN productos pr ON pr.id_producto = inv.id_producto
    JOIN sucursales s ON s.id_sucursal = inv.id_sucursal
    WHERE inv.cantidad <= inv.stock_minimo
      AND pr.activo = TRUE
    ORDER BY (inv.cantidad::float / NULLIF(inv.stock_minimo,0)) ASC, pr.nombre_producto
    LIMIT 20
  `
  const { rows } = await pool.query<StockBajoDb>(sql)
  return rows
}

export async function getActividadReciente(): Promise<ActividadRecienteDb[]> {
  const sql = `
    SELECT
      ls.id_log,
      ls.accion,
      ls.modulo,
      ls.tipo_evento,
      ls.descripcion,
      ls.fecha_evento,
      u.nombre_usuario,
      e.nombres AS usuario_nombre,
      e.apellidos AS usuario_apellido
    FROM logs_sistema ls
    LEFT JOIN usuarios u ON u.id_usuario = ls.id_usuario
    LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
    ORDER BY ls.fecha_evento DESC
    LIMIT 15
  `
  const { rows } = await pool.query<ActividadRecienteDb>(sql)
  return rows
}

export async function getEficienciaClinica(): Promise<EficienciaClinicaDb> {
  const sql = `
    WITH mes AS (
      SELECT date_trunc('month', CURRENT_DATE) AS ini, date_trunc('month', CURRENT_DATE) + interval '1 month' AS fin
    )
    SELECT
      COALESCE((SELECT COUNT(*) FROM citas c, mes WHERE c.estado_cita = 'completada' AND c.fecha_hora_cita >= mes.ini AND c.fecha_hora_cita < mes.fin), 0) AS citas_completadas_mes,
      COALESCE((SELECT COUNT(*) FROM citas c, mes WHERE c.fecha_hora_cita >= mes.ini AND c.fecha_hora_cita < mes.fin AND c.estado_cita IN ('confirmada','completada','en_espera_confirmacion','reprogramada')), 0) AS citas_programadas_mes,
      COALESCE((SELECT COUNT(*) FROM recetas r JOIN consultas co ON co.id_consulta = r.id_consulta, mes WHERE co.fecha_hora_consulta >= mes.ini AND co.fecha_hora_consulta < mes.fin), 0) AS recetas_emitidas_mes,
      COALESCE((SELECT COUNT(*) FROM consultas co, mes WHERE co.fecha_hora_consulta >= mes.ini AND co.fecha_hora_consulta < mes.fin), 0) AS consultas_mes
  `
  const { rows } = await pool.query<EficienciaClinicaDb>(sql)
  return rows[0]
}
