"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Mail, AlertCircle, Sparkles, HelpCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function Login() {
  const toast = useToast();
  const router = useRouter();

  // Estados de Formulario
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({});
  
  // Estados de API
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showForgotMsg, setShowForgotMsg] = useState(false);

  // Estados de Seguridad
  const [blocked, setBlocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Countdown para bloqueo de intentos
  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (blocked) setBlocked(false);
      return;
    }
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds, blocked]);

  // Validación local en tiempo real / submit
  const validarFormulario = () => {
    const tempErrors: { correo?: string; password?: string } = {};
    let isValid = true;

    if (!correo) {
      tempErrors.correo = "El correo electrónico es requerido.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      tempErrors.correo = "El formato de correo no es válido.";
      isValid = false;
    }

    if (!password) {
      tempErrors.password = "La contraseña es requerida.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (blocked) return;
    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setBlocked(true);
        setRemainingSeconds(data.remainingSeconds || 600);
        throw new Error(data.error || "Demasiados intentos fallidos. Acceso bloqueado.");
      }

      if (!res.ok) {
        const attemptsLeftMsg = data.attemptsLeft !== undefined ? ` Intentos restantes: ${data.attemptsLeft}.` : "";
        throw new Error((data.error || "Error al iniciar sesión.") + attemptsLeftMsg);
      }

      // Login exitoso, redirección según rol
      const rol = data.usuario?.rol;
      const estadoCuenta = data.usuario?.estado_cuenta;

      toast.success(`¡Bienvenido de nuevo, ${data.usuario?.nombre || "Usuario"}!`, "Acceso Concedido");
      
      if (rol === "admin") {
        router.push("/admin");
      } else if (estadoCuenta === "expirado") {
        router.push("/membresia-expirada");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Error al conectar con el servidor.";
      setApiError(errorMsg);
      toast.error(errorMsg, "Error de Acceso");
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir segundos de bloqueo a mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden py-12 px-6">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/15 filter blur-[80px] pointer-events-none" />

      {/* Volver a la Landing */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-semibold text-muted hover:text-primary flex items-center gap-1.5 transition-colors group select-none">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Volver al inicio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-card border border-card-border p-8 rounded-xl shadow-premium z-10"
      >
        {/* Brand/Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 select-none">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-black text-foreground tracking-tight select-none">
            Kchimbo<span className="text-primary">+</span>
          </h1>
          <p className="text-xs text-muted mt-1.5 font-bold uppercase tracking-wider select-none">
            Aula Virtual e Iniciar Sesión
          </p>
        </div>

        {/* Errores */}
        {apiError && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 mb-6">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Bloqueo Countdown */}
        {blocked && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-center font-bold text-sm mb-6 flex flex-col gap-1.5">
            <span>Inicio de sesión temporalmente deshabilitado</span>
            <span className="text-xl font-black font-display text-orange-500 animate-pulse">
              Intenta de nuevo en {formatTime(remainingSeconds)}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="tu@correo.com"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              if (errors.correo) setErrors({ ...errors, correo: "" });
            }}
            error={errors.correo}
            disabled={isLoading || blocked}
            icon={<Mail className="h-4 w-4 text-muted/50" />}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted select-none">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowForgotMsg(true)}
                className="text-xs font-bold text-primary hover:underline focus:outline-none select-none"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <div className="relative">
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                disabled={isLoading || blocked}
                className={`flex h-11 w-full rounded-md border ${errors.password ? "border-red-500" : "border-card-border"} bg-background px-3 py-2 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/50" />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.password}</span>
            )}
          </div>

          {showForgotMsg && (
            <div className="p-3.5 rounded bg-primary/5 border border-primary/15 text-xs text-primary-dark font-semibold leading-relaxed flex items-start gap-2">
              <HelpCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Comunícate con el administrador al correo{" "}
                <strong className="text-foreground">kchimbo.elite@gmail.com</strong> para reestablecer o recuperar tu contraseña.
              </span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={blocked}
            className="w-full !rounded-xl font-bold mt-2"
          >
            Iniciar Sesión
          </Button>

          {/* Registro CTA */}
          <div className="flex flex-col items-center gap-2 border-t border-card-border/50 pt-5 mt-2">
            <span className="text-xs text-muted font-semibold">¿Eres nuevo estudiante?</span>
            <Link href="/registro" className="w-full">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full !rounded-xl font-bold border-card-border hover:border-primary/40 hover:text-primary flex items-center justify-center gap-2"
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Crear una Cuenta Gratis
              </Button>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
