"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
// ── Mock del repositorio para aislar la lógica del servicio ───────────────────
globals_1.jest.mock('../../src/modules/autenticacion/autenticacion.repository', () => ({
    findUsuarioByEmail: globals_1.jest.fn(),
    registrarIntentoLogin: globals_1.jest.fn(),
    crearSesion: globals_1.jest.fn(),
    invalidarSesiones: globals_1.jest.fn(),
    findSesionByRefreshToken: globals_1.jest.fn(),
    findPermisosByRol: globals_1.jest.fn(),
    updatePassword: globals_1.jest.fn(),
}));
globals_1.jest.mock('../../src/config/database', () => ({
    query: globals_1.jest.fn(),
    withTransaction: globals_1.jest.fn(),
}));
const repo = __importStar(require("../../src/modules/autenticacion/autenticacion.repository"));
const autenticacion_service_1 = require("../../src/modules/autenticacion/autenticacion.service");
const mockRepo = repo;
// ── Fixture de usuario ────────────────────────────────────────────────────────
const USUARIO_FIXTURE = {
    id_usuario: 1,
    id_empleado: 1,
    email: 'admin@drlentes.com',
    contrasena_hash: '$2b$12$QnH.8GHtSbNLb3h5HtZ4uuHXfCXYiJMZqpYGNGS5qKaM4fLQ6GUSO', // "Admin1234"
    activo: true,
    bloqueado: false,
    id_rol: 1,
    nombre_rol: 'Administrador',
    id_sucursal: 1,
    nombre: 'Roberto',
    apellido: 'Smith',
};
(0, globals_1.describe)('autenticacion.service — loginService', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        mockRepo.findPermisosByRol.mockResolvedValue(['ventas.leer', 'ventas.crear']);
        mockRepo.registrarIntentoLogin.mockResolvedValue(undefined);
        mockRepo.crearSesion.mockResolvedValue(undefined);
    });
    (0, globals_1.it)('lanza 401 si el usuario no existe', async () => {
        mockRepo.findUsuarioByEmail.mockResolvedValue(null);
        await (0, globals_1.expect)((0, autenticacion_service_1.loginService)({ email: 'noexiste@email.com', contrasena: 'Pass123' }, '127.0.0.1', 'Jest')).rejects.toMatchObject({ statusCode: 401 });
    });
    (0, globals_1.it)('lanza 403 si el usuario está desactivado', async () => {
        mockRepo.findUsuarioByEmail.mockResolvedValue({ ...USUARIO_FIXTURE, activo: false });
        await (0, globals_1.expect)((0, autenticacion_service_1.loginService)({ email: 'admin@drlentes.com', contrasena: 'Pass123' }, '127.0.0.1', 'Jest')).rejects.toMatchObject({ statusCode: 403 });
    });
    (0, globals_1.it)('lanza 403 si el usuario está bloqueado', async () => {
        mockRepo.findUsuarioByEmail.mockResolvedValue({ ...USUARIO_FIXTURE, bloqueado: true });
        await (0, globals_1.expect)((0, autenticacion_service_1.loginService)({ email: 'admin@drlentes.com', contrasena: 'Pass123' }, '127.0.0.1', 'Jest')).rejects.toMatchObject({ statusCode: 403 });
    });
    (0, globals_1.it)('lanza 401 si la contraseña es incorrecta', async () => {
        mockRepo.findUsuarioByEmail.mockResolvedValue(USUARIO_FIXTURE);
        await (0, globals_1.expect)((0, autenticacion_service_1.loginService)({ email: 'admin@drlentes.com', contrasena: 'MalPassword' }, '127.0.0.1', 'Jest')).rejects.toMatchObject({ statusCode: 401 });
    });
    (0, globals_1.it)('registra intento fallido cuando la contraseña es incorrecta', async () => {
        mockRepo.findUsuarioByEmail.mockResolvedValue(USUARIO_FIXTURE);
        await (0, autenticacion_service_1.loginService)({ email: 'admin@drlentes.com', contrasena: 'MalPassword' }, '127.0.0.1', 'Jest').catch(() => { });
        (0, globals_1.expect)(mockRepo.registrarIntentoLogin).toHaveBeenCalledWith(1, false, '127.0.0.1');
    });
});
(0, globals_1.describe)('autenticacion.service — logoutService', () => {
    (0, globals_1.it)('llama a invalidarSesiones con el id del usuario', async () => {
        mockRepo.invalidarSesiones.mockResolvedValue(undefined);
        await (0, autenticacion_service_1.logoutService)(42);
        (0, globals_1.expect)(mockRepo.invalidarSesiones).toHaveBeenCalledWith(42);
    });
});
//# sourceMappingURL=autenticacion.service.test.js.map