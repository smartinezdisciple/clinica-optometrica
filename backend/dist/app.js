"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const env_1 = require("./config/env");
const manejo_errores_1 = require("./middleware/manejo-errores");
const autenticacion_routes_1 = require("./modules/autenticacion/autenticacion.routes");
const sucursales_routes_1 = require("./modules/sucursales/sucursales.routes");
const usuarios_routes_1 = require("./modules/usuarios/usuarios.routes");
const pacientes_routes_1 = require("./modules/pacientes/pacientes.routes");
const empresas_routes_1 = require("./modules/empresas/empresas.routes");
const citas_routes_1 = require("./modules/citas/citas.routes");
const app = (0, express_1.default)();
// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true, // Necesario para cookies del refresh token
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/auth/login', (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 intentos máximo
    message: { ok: false, error: 'Demasiados intentos. Espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use((0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000, // 1 minuto
    max: 200,
    message: { ok: false, error: 'Demasiadas peticiones. Intenta de nuevo.' },
    standardHeaders: true,
    legacyHeaders: false,
}));
// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ── Logger ────────────────────────────────────────────────────────────────────
if (env_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}
// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ ok: true, status: 'running', version: '1.0.0', env: env_1.env.NODE_ENV });
});
// ── Rutas de la API ───────────────────────────────────────────────────────────
app.use('/api/auth', autenticacion_routes_1.autenticacionRouter);
app.use('/api/sucursales', sucursales_routes_1.sucursalesRouter);
app.use('/api/usuarios', usuarios_routes_1.usuariosRouter);
app.use('/api/empleados', usuarios_routes_1.empleadosRouter);
app.use('/api/pacientes', pacientes_routes_1.pacientesRouter);
app.use('/api/empresas', empresas_routes_1.empresasRouter);
app.use('/api/citas', citas_routes_1.citasRouter);
// TODO: Agregar más routers por módulo:
// app.use('/api/ventas',    ventasRouter)
// app.use('/api/inventario', inventarioRouter)
// ── Manejo centralizado de errores ────────────────────────────────────────────
app.use(manejo_errores_1.manejoErrores);
// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
});
// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
    app.listen(env_1.env.PORT, () => {
        console.log(`✅  Backend corriendo en http://localhost:${env_1.env.PORT}`);
        console.log(`   Entorno: ${env_1.env.NODE_ENV}`);
        console.log(`   Frontend: ${env_1.env.FRONTEND_URL}`);
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map