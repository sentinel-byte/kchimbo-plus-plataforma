export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getProgreso, guardarProgreso } from "@/lib/google-sheets";

const JWT_SECRET = process.env.JWT_SECRET || "kchimbo_super_secret_fallback_key";

// Obtener id_usuario desde la sesión JWT
function getUsuarioIdDesdeCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const parts = cookie.trim().split("=");
      return [parts[0], parts.slice(1).join("=")];
    })
  );

  const token = cookies["kchimbo_session"];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.id;
  } catch (e) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const usuarioId = getUsuarioIdDesdeCookie(request);
    if (!usuarioId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const progreso = await getProgreso(usuarioId);
    return NextResponse.json({ success: true, progreso });
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    return NextResponse.json({ error: "Error en el servidor." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const usuarioId = getUsuarioIdDesdeCookie(request);
    if (!usuarioId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { idCurso, idTema, completado } = body;

    if (!idCurso || !idTema || completado === undefined) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    await guardarProgreso(usuarioId, idCurso, idTema, completado);
    
    return NextResponse.json({ success: true, message: "Progreso actualizado correctamente." });
  } catch (error) {
    console.error("Error al guardar progreso:", error);
    return NextResponse.json({ error: "Error en el servidor." }, { status: 500 });
  }
}
