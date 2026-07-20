export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { actualizarUsuario } from "@/lib/google-sheets";

const JWT_SECRET = process.env.JWT_SECRET || "kchimbo_super_secret_fallback_key";

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

export async function PUT(request: Request) {
  try {
    if (!esAdmin(request)) {
      return NextResponse.json(
        { error: "No autorizado. Requiere rol de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_usuario, fecha_inicio, fecha_fin, estado_cuenta } = body;

    if (!id_usuario || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { error: "ID del usuario, fecha de inicio y fecha de fin son requeridos." },
        { status: 400 }
      );
    }

    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return NextResponse.json(
        { error: "Las fechas proporcionadas no son válidas." },
        { status: 400 }
      );
    }

    if (fechaFin <= fechaInicio) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio." },
        { status: 400 }
      );
    }

    const usuarioActualizado = await actualizarUsuario(id_usuario, {
      estado_cuenta: estado_cuenta || "activo",
      plan: "premium",
      fecha_inicio_membresia: fechaInicio.toISOString(),
      fecha_fin_membresia: fechaFin.toISOString(),
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    });

    if (!usuarioActualizado) {
      return NextResponse.json(
        { error: "No se encontró el usuario especificado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        estado_cuenta: usuarioActualizado.estado_cuenta,
        fecha_inicio_membresia: usuarioActualizado.fecha_inicio_membresia,
        fecha_fin_membresia: usuarioActualizado.fecha_fin_membresia,
      },
    });
  } catch (error) {
    console.error("Error al activar cuenta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
