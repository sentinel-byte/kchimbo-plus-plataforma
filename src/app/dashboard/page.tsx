"use client";

import React, { useState, useEffect } from "react";
import { User, Sparkles, Trophy, BookOpen, Clock, Calendar } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { Curso } from "@/lib/mock-data";
import { SheetProgreso } from "@/lib/google-sheets";

export default function StudentDashboard() {
  const [usuario, setUsuario] = useState<{ nombre: string; correo: string; rol: string; plan: string } | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [progreso, setProgreso] = useState<SheetProgreso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resUser, resCursos, resProgreso] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/cursos"),
          fetch("/api/progreso"),
        ]);

        if (!resUser.ok) throw new Error("No autenticado");
        
        const [dataUser, dataCursos, dataProgreso] = await Promise.all([
          resUser.json(),
          resCursos.json(),
          resProgreso.json(),
        ]);

        setUsuario(dataUser.usuario);
        setCursos(dataCursos.cursos || []);
        setProgreso(dataProgreso.progreso || []);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return <Loader size="md" />;
  }

  // Calcular métricas globales de progreso
  const totalTemas = cursos.reduce((acc, c) => acc + (c.temas?.length || 0), 0);
  const temasCompletados = progreso.filter((p) => p.completado === "TRUE").length;
  const porcentajeGlobal = totalTemas > 0 ? Math.round((temasCompletados / totalTemas) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      {/* Caja de Bienvenida e Identidad */}
      <div className="relative overflow-hidden p-8 md:p-10 rounded-2xl bg-card border border-card-border shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all">
        {/* Círculo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl -z-10 translate-x-16 -translate-y-16" />

        <div className="flex items-center gap-5">
          {/* Iniciales / Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-secondary/5 border border-primary/20 flex items-center justify-center font-display font-black text-primary text-3xl shadow-sm flex-shrink-0">
            {(usuario?.nombre || "U")[0].toUpperCase()}
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Estudiante Kchimbo+
            </span>
            <h1 className="font-display text-3xl font-black text-foreground tracking-tight">
              {usuario?.nombre}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-muted font-medium">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Rol: Estudiante
              </span>
              <span>&bull;</span>
              <span>{usuario?.correo}</span>
            </div>
          </div>
        </div>

        {/* Badge del Plan de la membresía */}
        <div className="px-5 py-3 rounded-xl bg-background border border-card-border/60 flex flex-col gap-0.5 shadow-sm min-w-[150px] text-center md:text-left">
          <span className="text-[9px] font-bold text-muted uppercase tracking-widest">
            Tipo de Membresía
          </span>
          <span className="text-sm font-black text-primary uppercase tracking-wider mt-0.5">
            Plan {usuario?.plan || "Gratuito"}
          </span>
        </div>
      </div>

      {/* Tarjeta de Avance General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avance en Clases */}
        <div className="p-8 rounded-2xl bg-card border border-card-border/75 shadow-premium flex flex-col justify-between gap-6 md:col-span-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">Avance en Clases</h3>
            </div>
            <p className="text-xs text-muted font-medium">
              Porcentaje general de tu progreso académico completado en Kchimbo+.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-foreground font-display">
                {porcentajeGlobal}%
              </span>
              <span className="text-xs font-semibold text-muted">
                {temasCompletados} de {totalTemas} lecciones finalizadas
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-card-border/50">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${porcentajeGlobal}%` }}
              />
            </div>
          </div>
        </div>

        {/* Resumen de Asignaturas */}
        <div className="p-8 rounded-2xl bg-card border border-card-border/75 shadow-premium flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">Asignaturas</h3>
            </div>
            <p className="text-xs text-muted font-medium">
              Cursos disponibles organizados en tu malla de estudios.
            </p>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground font-display">
              {cursos.length}
            </span>
            <span className="text-xs font-semibold text-muted mt-1">
              Cursos cargados en tu cuenta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
