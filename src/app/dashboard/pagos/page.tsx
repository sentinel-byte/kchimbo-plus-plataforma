"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Calendar, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

interface UsuarioMembresia {
  id: string;
  nombre: string;
  correo: string;
  plan: "gratis" | "premium";
  estado_cuenta: "trial" | "activo" | "expirado" | "bloqueado";
  fecha_inicio_membresia: string | null;
  fecha_fin_membresia: string | null;
}

export default function PagosDashboard() {
  const [usuario, setUsuario] = useState<UsuarioMembresia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUsuario(data.usuario);
        }
      } catch (err) {
        console.error("Error al obtener datos de membresía:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, []);

  if (loading) {
    return <Loader size="md" />;
  }

  const formatFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "-";
    const d = new Date(fechaStr);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determinar colores y textos según estado
  let statusBadgeColor = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
  let statusText = "Período de Prueba (Trial)";
  let statusDescription = "Tu cuenta tiene acceso temporal de prueba de 1 día. Al finalizar, podrás solicitar acceso anual.";

  if (usuario?.estado_cuenta === "activo") {
    statusBadgeColor = "bg-green-500/10 text-green-600 border border-green-500/20";
    statusText = "Membresía Activa";
    statusDescription = "Tienes acceso premium completo e ilimitado a todos los cursos y materiales.";
  } else if (usuario?.estado_cuenta === "expirado") {
    statusBadgeColor = "bg-red-500/10 text-red-500 border border-red-500/20";
    statusText = "Membresía Expirada";
    statusDescription = "Tu membresía ha vencido. Ponte en contacto con nosotros para renovar tu acceso.";
  } else if (usuario?.estado_cuenta === "bloqueado") {
    statusBadgeColor = "bg-gray-500/10 text-gray-500 border border-gray-500/20";
    statusText = "Cuenta Bloqueada";
    statusDescription = "Tu cuenta ha sido restringida de forma temporal por el administrador.";
  }

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <CreditCard className="h-8 w-8 text-primary" /> Membresía y Pagos
        </h1>
        <p className="text-xs text-muted mt-1">
          Visualiza los detalles, vigencia y estado de tu plan actual en Kchimbo+.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Resumen del Plan */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-8 rounded-2xl bg-card border border-card-border shadow-premium flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                  Plan de Estudios
                </span>
                <span className="text-2xl font-black text-foreground font-display capitalize">
                  Kchimbo+ {usuario?.plan === "premium" ? "Premium" : "Gratuito"}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusBadgeColor}`}>
                {statusText}
              </span>
            </div>

            <div className="text-sm text-foreground/80 leading-relaxed font-medium">
              {statusDescription}
            </div>

            {/* Fechas de membresía */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2 border-t border-card-border/50 pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background border border-card-border/60 text-muted">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Fecha de Inicio
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formatFecha(usuario?.fecha_inicio_membresia || null)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background border border-card-border/60 text-muted">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Fecha de Finalización
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formatFecha(usuario?.fecha_fin_membresia || null)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Instrucciones o Caja Informativa de Activación */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-gradient-to-tr from-primary/5 via-primary/10 to-secondary/5 border border-primary/20 shadow-premium flex flex-col gap-5">
            <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5" /> Cuenta verificada
            </span>
            
            <p className="text-xs text-muted font-semibold leading-relaxed">
              Los pagos y membresías son administrados de forma centralizada por el equipo académico de Kchimbo+.
            </p>

            <div className="text-xs text-muted leading-relaxed font-semibold">
              Si requieres renovar tu plan o realizar el depósito anual, envía un correo a:
              <strong className="block text-foreground mt-1 text-sm">kchimbo.elite@gmail.com</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
