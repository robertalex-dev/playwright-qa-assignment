/**
 * Minimal JWT inspection — no library, no signature verification.
 *
 * A JWT is three base64url segments separated by dots: `header.payload.signature`.
 * Header and payload are plain JSON, so anyone holding the token can read them;
 * only the signature requires the server's secret to *verify*. That's why we can
 * decode here for assertions, but must never treat a decoded token as trusted.
 */

export interface JwtHeader {
  alg: string;
  typ?: string;
}

export interface JwtPayload {
  /** issued-at (seconds since epoch) */
  iat?: number;
  /** expiry (seconds since epoch) */
  exp?: number;
  [claim: string]: unknown;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
}

const decodeSegment = <T>(segment: string): T =>
  JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error(`Malformed JWT: expected 3 segments, got ${parts.length}`);
  }
  const [header, payload, signature] = parts as [string, string, string];
  return {
    header: decodeSegment<JwtHeader>(header),
    payload: decodeSegment<JwtPayload>(payload),
    signature,
  };
}

export function isJwtExpired(payload: JwtPayload, nowMs: number = Date.now()): boolean {
  return typeof payload.exp === 'number' && payload.exp * 1000 <= nowMs;
}

/** Never log a full token in CI output of a real system; for the demo API it's required by the task. */
export const maskToken = (token: string): string =>
  token.length <= 16 ? token : `${token.slice(0, 8)}…${token.slice(-8)}`;
