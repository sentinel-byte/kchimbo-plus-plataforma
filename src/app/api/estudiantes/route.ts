export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUsuarios, getProgreso, getCursos } from "@/lib/google-sheets";

const JWT_SECRET = process.env.JWT_SECRET || "kchimbo_super_secret_fallback_key";

// Verificar rol de admin a través de JWT
function esAdmin(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const parts = cookie.trim().split("=");
      return [parts[0], parts.slice(1).join("=")];
    })
  );

  const token = cookies["kchimbo_session"];
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.rol === "admin";
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    if (!esAdmin(request)) {
      return NextResponse.json({ error: "No autorizado. Requiere rol de administrador." }, { status: 403 });
    }

    const todosUsuarios = await getUsuarios();
    const estudiantes = todosUsuarios.filter((u) => u.rol === "estudiante");

    // Para cada estudiante, calcular su progreso de temas completados para mostrarlo en el panel
    const estudiantesConProgreso = await Promise.all(
      estudiantes.map(async (estudiante) => {
        const progreso = await getProgreso(estudiante.id);
        const completados = progreso.filter((p) => p.completado === "TRUE").length;
        
        return {
          id: estudiante.id,
          nombre: estudiante.nombre,
          apellidos: estudiante.apellidos,
          dni: estudiante.dni,
          username: estudiante.username,
          correo: estudiante.correo,
          plan: estudiante.plan,
          estado_cuenta: estudiante.estado_cuenta,
          fecha_registro: estudiante.fecha_registro,
          fecha_inicio_membresia: estudiante.fecha_inicio_membresia,
          fecha_fin_membresia: estudiante.fecha_fin_membresia,
          leccionesCompletadas: completados,
        };
      })
    );

    return NextResponse.json({ success: true, estudiantes: estudiantesConProgreso });
  } catch (error) {
    console.error("Error en API de estudiantes:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
