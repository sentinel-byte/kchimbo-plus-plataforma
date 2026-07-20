export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { registrarTema, actualizarTema } from "@/lib/google-sheets";

const JWT_SECRET = process.env.JWT_SECRET || "kchimbo_super_secret_fallback_key";

// Verificar si el rol de la sesión es admin
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

export async function POST(request: Request) {
  try {
    // Validar rol de administrador
    if (!esAdmin(request)) {
      return NextResponse.json(
        { error: "No autorizado. Requiere rol de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id_curso,
      orden,
      titulo,
      duracion,
      video_teoria_url,
      video_practica_url,
      pdf_resumen_url,
      pdf_teoria_url,
      pdf_preguntas_url,
    } = body;

    // Validaciones de campos obligatorios
    if (!id_curso || !titulo || orden === undefined || !duracion || !video_teoria_url) {
      return NextResponse.json(
        { error: "Por favor, completa los campos requeridos de la lección (Curso, Título, Orden, Duración y Video de Teoría)." },
        { status: 400 }
      );
    }

    const nuevoTema = await registrarTema({
      id_curso,
      orden: parseInt(orden) || 1,
      titulo,
      duracion,
      video_teoria_url,
      video_practica_url: video_practica_url || undefined,
      pdf_resumen_url: pdf_resumen_url || undefined,
      pdf_teoria_url: pdf_teoria_url || undefined,
      pdf_preguntas_url: pdf_preguntas_url || undefined,
    });

    return NextResponse.json({ success: true, tema: nuevoTema });
  } catch (error) {
    console.error("Error al registrar lección:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar la lección." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Validar rol de administrador
    if (!esAdmin(request)) {
      return NextResponse.json(
        { error: "No autorizado. Requiere rol de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id_tema,
      id_curso,
      orden,
      titulo,
      duracion,
      video_teoria_url,
      video_practica_url,
      pdf_resumen_url,
      pdf_teoria_url,
      pdf_preguntas_url,
    } = body;

    // Validaciones de campos obligatorios
    if (!id_tema || !id_curso || !titulo || orden === undefined || !duracion || !video_teoria_url) {
      return NextResponse.json(
        { error: "Por favor, completa los campos requeridos de la lección (Tema, Curso, Título, Orden, Duración y Video de Teoría)." },
        { status: 400 }
      );
    }

    const temaEditado = await actualizarTema({
      id_tema,
      id_curso,
      orden: parseInt(orden) || 1,
      titulo,
      duracion,
      video_teoria_url,
      video_practica_url: video_practica_url || undefined,
      pdf_resumen_url: pdf_resumen_url || undefined,
      pdf_teoria_url: pdf_teoria_url || undefined,
      pdf_preguntas_url: pdf_preguntas_url || undefined,
    });

    return NextResponse.json({ success: true, tema: temaEditado });
  } catch (error) {
    console.error("Error al actualizar lección:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al actualizar la lección." },
      { status: 500 }
    );
  }
}

