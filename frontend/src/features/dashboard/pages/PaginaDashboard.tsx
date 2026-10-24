import { Link } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { TarjetaKpi } from '../components/TarjetaKpi'
import { GraficaVentasMensuales } from '../components/GraficaVentasMensuales'
import { ListaProximasCitas } from '../components/ListaProximasCitas'
import { ListaStockBajo } from '../components/ListaStockBajo'
import { ListaActividadReciente } from '../components/ListaActividadReciente'
import { PanelEficienciaClinica } from '../components/PanelEficienciaClinica'
import {
  useDashboardKpis,
  useDashboardVentasMensuales,
  useDashboardProximasCitas,
  useDashboardStockBajo,
  useDashboardActividadReciente,
  useDashboardEficienciaClinica,
} from '../hooks/useDashboard'

function formatoMoneda(valor: number) {
  return `C$${valor.toLocaleString('es-NI')}`
}

export default function PaginaDashboard() {
  const usuario = useAuthStore((s) => s.usuario)
  const { data: kpis, isLoading: loadingKpis } = useDashboardKpis()
  const { data: ventasMensuales = [], isLoading: loadingVentas } = useDashboardVentasMensuales()
  const { data: proximasCitas = [] } = useDashboardProximasCitas()
  const { data: stockBajo = [] } = useDashboardStockBajo()
  const { data: actividad = [] } = useDashboardActividadReciente()
  const { data: eficiencia } = useDashboardEficienciaClinica()

  const nombre = usuario?.nombre || 'Usuario'

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-up">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface">Hola de nuevo, {nombre}</h1>
          <p className="text-outline text-sm mt-1">Resumen ejecutivo del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/reportes" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-surface-container text-sm font-semibold text-on-surface hover:border-primary/40 transition-colors">
            <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            Ver reportes
          </Link>
          <Link to="/ventas" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            Ir a ventas
          </Link>
        </div>
      </header>

      {loadingKpis && (
        <div className="flex items-center justify-center py-10">
          <CargadorIris />
        </div>
      )}

      {kpis && (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <TarjetaKpi titulo="Ventas hoy" valor={formatoMoneda(kpis.ventas_hoy_monto)} subtitulo={`${kpis.ventas_hoy_cantidad} venta(s) finalizada(s)`} icono="payments" color="primary" />
          <TarjetaKpi titulo="Citas hoy" valor={`${kpis.citas_hoy_completadas} / ${kpis.citas_hoy_total}`} subtitulo="Completadas / Programadas" icono="event_available" color="primary" />
          <TarjetaKpi titulo="Pacientes nuevos (mes)" valor={String(kpis.pacientes_nuevos_mes)} subtitulo="Registrados este mes" icono="group_add" color="secondary" />
          <TarjetaKpi titulo="Alertas de stock" valor={String(kpis.stock_bajo_count)} subtitulo="Productos con stock bajo" icono="inventory" color="tertiary" />
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Tarjeta className="xl:col-span-2">
          <header className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">Ventas mensuales</h2>
              <p className="text-xs text-outline">Ingresos del año en curso</p>
            </div>
            <Link to="/reportes" className="text-xs font-semibold text-primary hover:underline">Ver detalle</Link>
          </header>
          {loadingVentas ? <div className="flex items-center justify-center h-64"><CargadorIris /></div> : <GraficaVentasMensuales datos={ventasMensuales} />}
        </Tarjeta>

        <Tarjeta>
          <header className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">Próximas citas</h2>
              <p className="text-xs text-outline">Agenda por atender</p>
            </div>
            <Link to="/citas" className="text-xs font-semibold text-primary hover:underline">Ver agenda</Link>
          </header>
          <ListaProximasCitas citas={proximasCitas} />
        </Tarjeta>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Tarjeta>
          <header className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">Stock bajo</h2>
              <p className="text-xs text-outline">Requiere reposición</p>
            </div>
            <Link to="/inventario" className="text-xs font-semibold text-primary hover:underline">Ir a inventario</Link>
          </header>
          <ListaStockBajo items={stockBajo} />
        </Tarjeta>

        <Tarjeta>
          <header className="mb-4">
            <h2 className="font-headline font-bold text-lg text-on-surface">Eficiencia clínica</h2>
            <p className="text-xs text-outline">Desempeño del mes en curso</p>
          </header>
          {eficiencia ? <PanelEficienciaClinica data={eficiencia} /> : <div className="flex items-center justify-center py-6"><CargadorIris /></div>}
        </Tarjeta>

        <Tarjeta>
          <header className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">Actividad reciente</h2>
              <p className="text-xs text-outline">Últimos movimientos</p>
            </div>
            <Link to="/auditoria" className="text-xs font-semibold text-primary hover:underline">Ver auditoría</Link>
          </header>
          <ListaActividadReciente items={actividad} />
        </Tarjeta>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/ventas" className="bg-white rounded-2xl border border-surface-container p-4 flex items-center gap-3 hover:border-primary/40 transition-colors shadow-[0_2px_12px_rgba(0,101,141,.05)]">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">point_of_sale</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Ventas</p>
            <p className="text-xs text-outline">Punto de venta</p>
          </div>
        </Link>
        <Link to="/historias-clinicas" className="bg-white rounded-2xl border border-surface-container p-4 flex items-center gap-3 hover:border-primary/40 transition-colors shadow-[0_2px_12px_rgba(0,101,141,.05)]">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">clinical_notes</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Historias clínicas</p>
            <p className="text-xs text-outline">Expedientes y consultas</p>
          </div>
        </Link>
        <Link to="/inventario" className="bg-white rounded-2xl border border-surface-container p-4 flex items-center gap-3 hover:border-primary/40 transition-colors shadow-[0_2px_12px_rgba(0,101,141,.05)]">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Inventario</p>
            <p className="text-xs text-outline">Productos y stock</p>
          </div>
        </Link>
      </section>
    </div>
  )
}
