import jwt, { SignOptions, JwtPayload as DefaultPayload } from "jsonwebtoken";

export interface JwtSignPayload {
    userId: number;
    role: string;
}

export interface JwtDecoded extends DefaultPayload, JwtSignPayload { }

// Вспомогательная функция, которая выбрасывает, если секрет не задан
function getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET must be defined in env");
    }
    return secret;
}

/**
 * Подписывает JWT с нашим payload.
 */
export function signJwt(
    payload: JwtSignPayload,
    expiresIn: string = "1h"
): string {
    const options: SignOptions = { expiresIn };
    // getSecret() точно возвращает string, TS уже не шумит
    return jwt.sign(payload, getSecret(), options);
}

/**
 * Верифицирует JWT и возвращает декодированный payload.
 */
export function verifyJwt(token: string): JwtDecoded {
    return jwt.verify(token, getSecret()) as JwtDecoded;
}
