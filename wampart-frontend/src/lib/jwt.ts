export interface JwtClaims {
  sub: string;
  exp: number;
  iat?: number;
  // Spring Boot can use any of these for role
  role?: string;
  roles?: string | string[];
  authorities?: string | string[] | { authority: string }[];
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

/** Extract the role string regardless of which claim field the backend uses. */
export function getRoleFromToken(token: string): string | null {
  const claims = decodeJwt(token);
  if (!claims) return null;

  // Plain string: { role: "ADMIN" } or { role: "ROLE_ADMIN" }
  if (typeof claims.role === "string") return claims.role.replace(/^ROLE_/, "");

  // Array: { roles: ["ADMIN"] } or { roles: ["ROLE_ADMIN"] }
  if (Array.isArray(claims.roles)) {
    const first = claims.roles[0];
    const val = typeof first === "string" ? first : null;
    return val ? val.replace(/^ROLE_/, "") : null;
  }
  if (typeof claims.roles === "string") return claims.roles.replace(/^ROLE_/, "");

  // Spring Security default: { authorities: [{ authority: "ROLE_ADMIN" }] }
  if (Array.isArray(claims.authorities)) {
    const first = claims.authorities[0];
    const raw = typeof first === "string" ? first : (first?.authority ?? null);
    return raw ? raw.replace(/^ROLE_/, "") : null;
  }

  return null;
}

export function isTokenExpired(token: string): boolean {
  const claims = decodeJwt(token);
  if (!claims) return true;
  return Date.now() / 1000 > claims.exp;
}
