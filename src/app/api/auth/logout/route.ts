export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Sesión cerrada correctamente." });
    
    // Eliminar la cookie de sesión expirándola inmediatamente
    response.cookies.set({
      name: "kchimbo_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al intentar cerrar la sesión." },
      { status: 500 }
    );
  }
}
