"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Mail, LogOut, ArrowRight, ShieldAlert, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface UserPayload {
  nombre: string;
  correo: string;
  dni?: string;
}

export default function MembresiaExpirada() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.usuario);
        }
      } catch (err) {
        console.error("Error al obtener usuario expirado:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.info("Has cerrado sesión correctamente.");
        router.push("/login");
      }
    } catch (err) {
      toast.error("Error al cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Clock className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Pre-escribir el correo electrónico
  const emailTo = "kchimbo.elite@gmail.com";
  const subject = encodeURIComponent("Solicitud de Acceso Anual — Kchimbo+");
  const body = encodeURIComponent(`Hola equipo de Kchimbo+,

Mi nombre es: ${user?.nombre || "[Tu Nombre Completo]"}
Correo registrado: ${user?.correo || "[Tu Correo]"}

Solicito la habilitación de mi cuenta anual de Kchimbo+. Por favor, envíenme el código QR o número de Yape y el número de cuenta bancaria para realizar el depósito correspondiente y proceder con la habilitación de mi cuenta.

Quedo atento. ¡Muchas gracias!`);

  const mailtoUrl = `mailto:${emailTo}?subject=${subject}&body=${body}`;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden py-12 px-6">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-500/5 filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 filter blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Card Principal */}
        <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500/5 via-red-500/10 to-primary/5 p-8 pb-6 border-b border-card-border/60 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4 animate-pulse">
              <ShieldAlert className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
              Membresía Expirada
            </h1>
            <p className="text-sm text-muted font-medium mt-1.5">
              Tu acceso temporal gratuito de 1 día ha llegado a su fin.
            </p>
          </div>

          <div className="p-8 flex flex-col gap-6">
            <div className="text-sm text-foreground/80 leading-relaxed font-medium space-y-4">
              <p>
                Hola <strong className="text-foreground">{user?.nombre || "estudiante"}</strong>, esperamos que hayas aprovechado al máximo tus primeras 24 horas en nuestra plataforma.
              </p>
              <p>
                Para continuar accediendo a la currícula interactiva de Medicina Humana, Ingeniería Civil y ciencias, es necesario activar tu membresía anual.
              </p>
            </div>

            {/* Caja de instrucciones de pago */}
            <div className="p-5 rounded-xl bg-background border border-card-border/60 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" /> Proceso de activación
              </span>
              <p className="text-xs text-muted font-semibold leading-relaxed">
                Envía un correo pre-escrito solicitando los números de Yape o cuenta bancaria. Realiza la transferencia y envíanos tu comprobante para habilitar tu cuenta en minutos.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3.5 mt-2">
              <a href={mailtoUrl} className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full !rounded-xl font-bold flex items-center justify-center gap-2 group"
                  leftIcon={<Mail className="h-5 w-5" />}
                  rightIcon={<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                >
                  Solicitar Cuenta Anual
                </Button>
              </a>

              <Button
                variant="outline"
                size="lg"
                onClick={handleLogout}
                className="w-full !rounded-xl font-bold border-card-border hover:border-red-200 hover:text-red-500"
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
