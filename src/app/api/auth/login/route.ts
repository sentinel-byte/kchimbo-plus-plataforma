export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUsuarios, actualizarUsuario } from "@/lib/google-sheets";
import { checkRateLimit } from "@/lib/rate-limit";

const JWT_SECRET = process.env.JWT_SECRET || "kchimbo_super_secret_fallback_key";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

    // Rate limiting por IP: 5 intentos, luego bloqueo de 10 minutos
    const rateLimitResult = checkRateLimit(ip, {
      limit: 5,
      windowMs: 60 * 1000,
      lockoutMs: 10 * 60 * 1000,
    });

    if (rateLimitResult.limited) {
      return NextResponse.json(
        {
          error: `Demasiados intentos. Acceso bloqueado temporalmente.`,
          remainingSeconds: rateLimitResult.remainingSeconds,
          blocked: true,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { correo, password } = body;

    if (!correo || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const usuarios = await getUsuarios();
    const usuario = usuarios.find((u) => u.correo.toLowerCase() === correo.toLowerCase());

    if (!usuario) {
      return NextResponse.json(
        { error: "Credenciales incorrectas.", attemptsLeft: rateLimitResult.attemptsLeft },
        { status: 401 }
      );
    }

    // Verificar si el usuario está bloqueado por intentos
    if (usuario.bloqueado_hasta) {
      const bloqueadoHasta = new Date(usuario.bloqueado_hasta);
      if (bloqueadoHasta > new Date()) {
        const remaining = Math.ceil((bloqueadoHasta.getTime() - Date.now()) / 1000);
        return NextResponse.json(
          {
            error: "Tu cuenta está bloqueada temporalmente por múltiples intentos fallidos.",
            remainingSeconds: remaining,
            blocked: true,
          },
          { status: 429 }
        );
      } else {
        // Desbloquear
        await actualizarUsuario(usuario.id, {
          bloqueado_hasta: null,
          intentos_fallidos: 0,
        });
      }
    }

    // Verificar contraseña
    let match = false;
    try {
      match = await bcrypt.compare(password, usuario.password_hash);
    } catch (e) {
      match = false;
    }

    // Fallback para testeo local si las credenciales de Google Sheets no están configuradas
    if (!match && !process.env.GOOGLE_SHEETS_ID) {
      const emailLower = correo.toLowerCase();
      if (emailLower === "admin@kchimbo.com" && password === "admin123") {
        match = true;
      } else if (emailLower === "estudiante@kchimbo.com" && password === "123456") {
        match = true;
      }
    }

    if (!match) {
      // Incrementar intentos fallidos
      const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
      const updateData: any = { intentos_fallidos: nuevosIntentos };

      if (nuevosIntentos >= 5) {
        updateData.bloqueado_hasta = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        updateData.estado_cuenta = "bloqueado";
        await actualizarUsuario(usuario.id, updateData);
        return NextResponse.json(
          {
            error: "Has excedido el número máximo de intentos. Tu cuenta ha sido bloqueada por 10 minutos.",
            remainingSeconds: 600,
            blocked: true,
          },
          { status: 429 }
        );
      }

      await actualizarUsuario(usuario.id, updateData);
      return NextResponse.json(
        {
          error: "Credenciales incorrectas.",
          attemptsLeft: 5 - nuevosIntentos,
        },
        { status: 401 }
      );
    }

    // Login exitoso — resetear intentos fallidos
    if (usuario.intentos_fallidos > 0) {
      await actualizarUsuario(usuario.id, {
        intentos_fallidos: 0,
        bloqueado_hasta: null,
        estado_cuenta: usuario.estado_cuenta === "bloqueado" ? "activo" : usuario.estado_cuenta,
      });
    }

    // Verificar estado de membresía
    let estadoCuenta = usuario.estado_cuenta || "trial";
    if (usuario.fecha_fin_membresia) {
      const fechaFin = new Date(usuario.fecha_fin_membresia);
      if (fechaFin < new Date() && estadoCuenta !== "expirado") {
        estadoCuenta = "expirado";
        await actualizarUsuario(usuario.id, { estado_cuenta: "expirado" });
      }
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        plan: usuario.plan,
        estado_cuenta: estadoCuenta,
        fecha_fin_membresia: usuario.fecha_fin_membresia,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        plan: usuario.plan,
        estado_cuenta: estadoCuenta,
      },
    });

    response.cookies.set({
      name: "kchimbo_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en endpoint de login:", error);
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor." },
      { status: 500 }
    );
  }
}
