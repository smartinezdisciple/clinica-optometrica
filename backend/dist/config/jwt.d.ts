export interface AccessTokenPayload {
    sub: number;
    rol: string;
    sucursalId: number;
}
export interface RefreshTokenPayload {
    sub: number;
    jti: string;
}
/**
 * Genera un access token JWT (duración: 15min).
 */
export declare function generarAccessToken(payload: AccessTokenPayload): string;
/**
 * Genera un refresh token JWT (duración: 7d).
 */
export declare function generarRefreshToken(payload: RefreshTokenPayload): string;
/**
 * Verifica y decodifica un access token.
 * @throws jwt.JsonWebTokenError si el token es inválido o expiró
 */
export declare function verificarAccessToken(token: string): AccessTokenPayload;
/**
 * Verifica y decodifica un refresh token.
 * @throws jwt.JsonWebTokenError si el token es inválido o expiró
 */
export declare function verificarRefreshToken(token: string): RefreshTokenPayload;
//# sourceMappingURL=jwt.d.ts.map