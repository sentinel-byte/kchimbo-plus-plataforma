import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("kchimbo_session")?.value;
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const isPremiumRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/curso");

  // Ruta de membresía expirada (accesible con token pero no requiere membresía activa)
  const isMembresiaExpiradaRoute = pathname.startsWith("/membresia-expirada");

  // Ruta de registro (pública)
  const isRegistroRoute = pathname.startsWith("/registro");

  if (isRegistroRoute) {
    // Si ya tiene sesión, redirigir al dashboard
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isPremiumRoute && !isMembresiaExpiradaRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar JWT payload para rutas protegidas
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      if (payloadBase64) {
        const payload = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString("utf-8")
        );

        // Verificar expiración del JWT
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expirado, limpiar cookie y redirigir a login
          const response = NextResponse.redirect(new URL("/login", request.url));
          response.cookies.delete("kchimbo_session");
          return response;
        }

        // Verificar que admin acceda solo a rutas admin
        if (pathname.startsWith("/admin") && payload.rol !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // Verificar membresía expirada para estudiantes
        if (
          payload.rol === "estudiante" &&
          !isMembresiaExpiradaRoute &&
          (pathname.startsWith("/dashboard") || pathname.startsWith("/curso"))
        ) {
          const estadoCuenta = payload.estado_cuenta;
          const fechaFin = payload.fecha_fin_membresia;

          if (estadoCuenta === "expirado" || estadoCuenta === "bloqueado") {
            return NextResponse.redirect(new URL("/membresia-expirada", request.url));
          }

          if (fechaFin && new Date(fechaFin) < new Date()) {
            return NextResponse.redirect(new URL("/membresia-expirada", request.url));
          }
        }

        // Si ya tiene sesión e intenta ir a login, redirigir a su área
        if (pathname === "/login") {
          if (payload.rol === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
          } else {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }
      }
    } catch (e) {
      // Token corrupto, continuar sin bloquear
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/curso/:path*", "/login", "/registro", "/membresia-expirada"],
};
