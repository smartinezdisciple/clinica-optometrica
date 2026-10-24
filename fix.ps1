$p = "backend/src/app.ts"
$s = Get-Content -LiteralPath $p -Raw
$s = $s.Replace("import { auditoriaRouter } from './modules/auditoria/auditoria.routes'`r`n", "import { auditoriaRouter } from './modules/auditoria/auditoria.routes'`r`nimport { dashboardRouter } from './modules/dashboard/dashboard.routes'`r`n")
$s = $s.Replace("app.use('/api/auditoria', auditoriaRouter)`r`n", "app.use('/api/auditoria', auditoriaRouter)`r`napp.use('/api/dashboard', dashboardRouter)`r`n")
Set-Content -LiteralPath $p -Value $s -NoNewline
