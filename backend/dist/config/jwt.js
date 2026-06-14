"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarAccessToken = generarAccessToken;
exports.generarRefreshToken = generarRefreshToken;
exports.verificarAccessToken = verificarAccessToken;
exports.verificarRefreshToken = verificarRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./env");
/**
 * Genera un access token JWT (duración: 15min).
 */
function generarAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRES,
        algorithm: 'HS256',
    });
}
/**
 * Genera un refresh token JWT (duración: 7d).
 */
function generarRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES,
        algorithm: 'HS256',
    });
}
/**
 * Verifica y decodifica un access token.
 * @throws jwt.JsonWebTokenError si el token es inválido o expiró
 */
function verificarAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
}
/**
 * Verifica y decodifica un refresh token.
 * @throws jwt.JsonWebTokenError si el token es inválido o expiró
 */
function verificarRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
}
//# sourceMappingURL=jwt.js.map