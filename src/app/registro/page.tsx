"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Mail, Lock, User, CreditCard, Eye, EyeOff, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { score, label: "Muy débil", color: "bg-red-500" };
  if (score === 2) return { score, label: "Débil", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Media", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Fuerte", color: "bg-green-500" };
  return { score, label: "Muy fuerte", color: "bg-emerald-500" };
}

export default function Registro() {
  const router = useRouter();
  const toast = useToast();

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [dni, setDni] = useState("");
  const [username, setUsername] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);

  const passwordChecks = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Un número", valid: /[0-9]/.test(password) },
    { label: "Un carácter especial (!@#$%...)", valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const validarFormulario = () => {
    const tempErrors: Record<string, string> = {};

    if (!nombre.trim() || nombre.trim().length < 2) {
      tempErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
    }
    if (!apellidos.trim() || apellidos.trim().length < 2) {
      tempErrors.apellidos = "Los apellidos deben tener al menos 2 caracteres.";
    }
    if (!/^\d{8}$/.test(dni)) {
      tempErrors.dni = "El DNI debe contener exactamente 8 dígitos numéricos.";
    }
    if (!/^[a-zA-Z0-9_.]{4,20}$/.test(username)) {
      tempErrors.username = "El usuario debe tener entre 4 y 20 caracteres alfanuméricos.";
    }
    if (!/\S+@\S+\.\S+/.test(correo)) {
      tempErrors.correo = "Ingresa un correo electrónico válido.";
    }
    if (password.length < 8) {
      tempErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (!/[A-Z]/.test(password)) {
      tempErrors.password = "Debe contener al menos una letra mayúscula.";
    } else if (!/[0-9]/.test(password)) {
      tempErrors.password = "Debe contener al menos un número.";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      tempErrors.password = "Debe contener al menos un carácter especial.";
    }
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          dni,
          username: username.trim().toLowerCase(),
          correo: correo.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al registrar tu cuenta.");
      }

      toast.success(
        "¡Tu cuenta ha sido creada exitosamente! Tienes 1 día de acceso gratuito para explorar la plataforma.",
        "¡Bienvenido a Kchimbo+!"
      );

      router.push("/dashboard");
    } catch (err: any) {
      const errorMsg = err.message || "Error al conectar con el servidor.";
      setApiError(errorMsg);
      toast.error(errorMsg, "Error de Registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden py-12 px-6">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/15 filter blur-[80px] pointer-events-none" />

      {/* Volver al inicio */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-semibold text-muted hover:text-primary flex items-center gap-1.5 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Volver al inicio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg"
      >
        {/* Card Principal */}
        <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 p-8 pb-6 border-b border-card-border/60 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
              Crear Cuenta Gratuita
            </h1>
            <p className="text-sm text-muted font-medium mt-1.5">
              Obtén 1 día de acceso gratis a toda la plataforma educativa.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
            {apiError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                {apiError}
              </div>
            )}

            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                placeholder="Carlos"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) setErrors({ ...errors, nombre: "" });
                }}
                error={errors.nombre}
                disabled={isLoading}
              />
              <Input
                label="Apellidos"
                type="text"
                placeholder="Mendoza Ríos"
                value={apellidos}
                onChange={(e) => {
                  setApellidos(e.target.value);
                  if (errors.apellidos) setErrors({ ...errors, apellidos: "" });
                }}
                error={errors.apellidos}
                disabled={isLoading}
              />
            </div>

            {/* DNI y Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="DNI"
                type="text"
                placeholder="12345678"
                maxLength={8}
                value={dni}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setDni(val);
                  if (errors.dni) setErrors({ ...errors, dni: "" });
                }}
                error={errors.dni}
                disabled={isLoading}
              />
              <Input
                label="Nombre de Usuario"
                type="text"
                placeholder="carlos.mendoza"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: "" });
                }}
                error={errors.username}
                disabled={isLoading}
              />
            </div>

            {/* Correo */}
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
              disabled={isLoading}
            />

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  disabled={isLoading}
                  className={`flex h-11 w-full rounded-md border ${errors.password ? "border-red-500" : "border-card-border"} bg-background px-3 py-2 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.password}</span>
              )}

              {/* Indicador de fortaleza */}
              {password.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-card-border/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      passwordStrength.score <= 2 ? "text-red-500" : passwordStrength.score <= 3 ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {passwordChecks.map((check) => (
                      <span key={check.label} className={`text-[10px] font-semibold flex items-center gap-1 ${check.valid ? "text-green-600" : "text-muted/60"}`}>
                        {check.valid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {check.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  }}
                  disabled={isLoading}
                  className={`flex h-11 w-full rounded-md border ${errors.confirmPassword ? "border-red-500" : "border-card-border"} bg-background px-3 py-2 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.confirmPassword}</span>
              )}
              {confirmPassword.length > 0 && password === confirmPassword && (
                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Las contraseñas coinciden
                </span>
              )}
            </div>

            {/* Trial Badge */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-primary-dark font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
              Al registrarte obtendrás <strong>1 día de acceso gratuito</strong> para explorar todos los cursos de la plataforma.
            </div>

            {/* Botón de Registro */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full !rounded-xl font-bold mt-2"
            >
              Crear mi Cuenta Gratis
            </Button>

            {/* Link a Login */}
            <p className="text-center text-sm text-muted font-medium">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
