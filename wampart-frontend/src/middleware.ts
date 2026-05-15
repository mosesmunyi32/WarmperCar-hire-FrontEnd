import { NextRequest, NextResponse } from "next/server"

function getTokenFromRequest(req: NextRequest): string | null {
  const raw = req.cookies.get("auth-storage")?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

// Inline role extraction — middleware runs on the Edge runtime and cannot
// import from src/lib/jwt.ts (Node-only modules would break the build).
function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    const claims = JSON.parse(json) as Record<string, unknown>

    if (typeof claims.role === "string") return claims.role.replace(/^ROLE_/, "")

    if (Array.isArray(claims.roles)) {
      const first = claims.roles[0]
      const val = typeof first === "string" ? first : null
      return val ? val.replace(/^ROLE_/, "") : null
    }
    if (typeof claims.roles === "string") return claims.roles.replace(/^ROLE_/, "")

    if (Array.isArray(claims.authorities)) {
      const first = claims.authorities[0] as string | { authority?: string }
      const raw = typeof first === "string" ? first : (first?.authority ?? null)
      return raw ? raw.replace(/^ROLE_/, "") : null
    }

    return null
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = getTokenFromRequest(req)
  const role = token ? getRoleFromToken(token) : null

  if (pathname.startsWith("/super-admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url))
    if (role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
  }

  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url))
    if (role !== "ADMIN" && role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"],
}
