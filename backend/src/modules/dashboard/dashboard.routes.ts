import { Router } from 'express'
import { kpis, ventasMensuales, proximasCitas, stockBajo, actividadReciente, eficienciaClinica } from './dashboard.controller'
import { autenticar } from '../../middleware/autenticacion'

export const dashboardRouter = Router()

dashboardRouter.use(autenticar)

dashboardRouter.get('/kpis', kpis)
dashboardRouter.get('/ventas-mensuales', ventasMensuales)
dashboardRouter.get('/proximas-citas', proximasCitas)
dashboardRouter.get('/stock-bajo', stockBajo)
dashboardRouter.get('/actividad-reciente', actividadReciente)
dashboardRouter.get('/eficiencia-clinica', eficienciaClinica)
