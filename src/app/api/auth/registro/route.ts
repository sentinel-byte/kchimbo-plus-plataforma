export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUsuarios, registrarUsuario } from "@/lib/google-sheets";

const JWT_SECRET = process.env.JWT_SECRET || "kchimbo_super_secret_fallback_key";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, apellidos, dni, username, correo, password } = body;

    // Validaciones
    if (!nombre || !apellidos || !dni || !username || !correo || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    if (nombre.trim().length < 2 || apellidos.trim().length < 2) {
      return NextResponse.json(
        { error: "Nombre y apellidos deben tener al menos 2 caracteres." },
        { status: 400 }
      );
    }

    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json(
        { error: "El DNI debe contener exactamente 8 dígitos numéricos." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_\.]{4,20}$/.test(username)) {
      return NextResponse.json(
        { error: "El nombre de usuario debe tener entre 4 y 20 caracteres alfanuméricos." },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(correo)) {
      return NextResponse.json(
        { error: "El formato de correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // Validar contraseña segura
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra mayúscula." },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un número." },
        { status: 400 }
      );
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un carácter especial (!@#$%^&*...)." },
        { status: 400 }
      );
    }

    // Verificar unicidad de correo, DNI y username
    const usuarios = await getUsuarios();
    if (usuarios.find((u) => u.correo.toLowerCase() === correo.toLowerCase())) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico." },
        { status: 409 }
      );
    }
    if (usuarios.find((u) => u.dni === dni)) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este DNI." },
        { status: 409 }
      );
    }
    if (usuarios.find((u) => u.username?.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json(
        { error: "Este nombre de usuario ya está en uso." },
        { status: 409 }
      );
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Fechas de trial (1 día)
    const ahora = new Date();
    const finTrial = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    const nuevoUsuario = await registrarUsuario({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      dni,
      username: username.trim().toLowerCase(),
      correo: correo.trim().toLowerCase(),
      password_hash: passwordHash,
      rol: "estudiante",
      plan: "gratis",
      estado_cuenta: "trial",
      fecha_inicio_membresia: ahora.toISOString(),
      fecha_fin_membresia: finTrial.toISOString(),
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    });

    // Generar JWT con datos de membresía
    const token = jwt.sign(
      {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        plan: nuevoUsuario.plan,
        estado_cuenta: nuevoUsuario.estado_cuenta,
        fecha_fin_membresia: nuevoUsuario.fecha_fin_membresia,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      success: true,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellidos: nuevoUsuario.apellidos,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        estado_cuenta: nuevoUsuario.estado_cuenta,
      },
    });

    response.cookies.set({
      name: "kchimbo_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en registro:", error);
    // En desarrollo mostramos el motivo real para poder depurar rápido.
    // En producción mantenemos un mensaje genérico por seguridad.
    const detalle =
      process.env.NODE_ENV !== "production" && error?.message
        ? error.message
        : "Ocurrió un error en el servidor. Inténtalo de nuevo en unos minutos.";
    return NextResponse.json({ error: detalle }, { status: 500 });
  }
}
