export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "kchimbo_super_secret_fallback_key";

export async function GET(request: Request) {
  try {
    // Obtener la cookie de sesión
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((cookie) => {
        const parts = cookie.trim().split("=");
        return [parts[0], parts.slice(1).join("=")];
      })
    );

    const token = cookies["kchimbo_session"];

    if (!token) {
      return NextResponse.json({ authenticated: false, error: "No autenticado" }, { status: 401 });
    }

    // Verificar firma del token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return NextResponse.json({
      authenticated: true,
      usuario: {
        id: decoded.id,
        nombre: decoded.nombre,
        correo: decoded.correo,
        rol: decoded.rol,
        plan: decoded.plan,
      },
    });
  } catch (error) {
    console.error("Error al obtener sesión en /api/auth/me:", error);
    return NextResponse.json({ authenticated: false, error: "Token inválido o expirado" }, { status: 401 });
  }
}
