export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getCursos, registrarCurso, actualizarCurso, eliminarCurso } from "@/lib/google-sheets";

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

// Verificar si hay una sesión válida (cualquier rol)
function tieneSesionValida(request: Request): boolean {
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
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // IMPORTANTE: antes este endpoint devolvía TODOS los cursos (incluyendo videos y PDFs
    // premium) sin exigir ninguna sesión — cualquiera podía acceder llamando directo a la
    // API, sin pagar ni iniciar sesión, saltándose por completo la protección de páginas
    // del middleware (el middleware solo protege rutas de página, no rutas /api).
    // Ahora se exige sesión válida, igual que en la página /curso.
    if (!tieneSesionValida(request)) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para ver el contenido de los cursos." },
        { status: 401 }
      );
    }

    const cursos = await getCursos();
    // Nota: al depender de la sesión del usuario, esta respuesta ya no se cachea como
    // pública. Sigue existiendo el caché interno de 5 min en getCursos() que evita golpear
    // la API de Google Sheets en cada llamada.
    return NextResponse.json({ success: true, cursos });
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de cursos." },
      { status: 500 }
    );
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
    const { titulo, descripcion, categoria, thumbnail_url, nivel } = body;

    // Validaciones
    if (!titulo || !descripcion || !categoria || !thumbnail_url || !nivel) {
      return NextResponse.json(
        { error: "Por favor, completa todos los campos del curso." },
        { status: 400 }
      );
    }

    const nuevoCurso = await registrarCurso({
      titulo,
      descripcion,
      categoria,
      thumbnail_url,
      nivel,
    });

    return NextResponse.json({ success: true, curso: nuevoCurso });
  } catch (error) {
    console.error("Error al registrar curso:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar el curso." },
      { status: 500 }
    );
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
    const { id_curso, titulo, descripcion, categoria, thumbnail_url, nivel, carrera } = body;

    if (!id_curso || !titulo || !descripcion || !categoria || !thumbnail_url || !nivel) {
      return NextResponse.json(
        { error: "Por favor, completa todos los campos del curso." },
        { status: 400 }
      );
    }

    const cursoEditado = await actualizarCurso({
      id_curso,
      titulo,
      descripcion,
      categoria,
      thumbnail_url,
      nivel,
      carrera: nivel === "Universitario" ? (carrera || "") : undefined,
    });

    return NextResponse.json({ success: true, curso: cursoEditado });
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al actualizar el curso." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!esAdmin(request)) {
      return NextResponse.json(
        { error: "No autorizado. Requiere rol de administrador." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idCurso = searchParams.get("idCurso");

    if (!idCurso) {
      return NextResponse.json(
        { error: "ID del curso requerido para eliminar." },
        { status: 400 }
      );
    }

    await eliminarCurso(idCurso);

    return NextResponse.json({ success: true, message: "Curso eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al eliminar el curso." },
      { status: 500 }
    );
  }
}

