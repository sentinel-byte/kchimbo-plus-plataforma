"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ChevronRight, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Curso } from "@/lib/mock-data";
import { SheetProgreso } from "@/lib/google-sheets";

export default function CursosDashboard() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [progreso, setProgreso] = useState<SheetProgreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Secundaria" | "Preuniversitario" | "Universitario">("Preuniversitario");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resCursos, resProgreso] = await Promise.all([
          fetch("/api/cursos"),
          fetch("/api/progreso"),
        ]);
        const dataCursos = await resCursos.json();
        const dataProgreso = await resProgreso.json();
        setCursos(dataCursos.cursos || []);
        setProgreso(dataProgreso.progreso || []);
      } catch (err) {
        console.error("Error al cargar cursos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) {
    return <Loader size="md" />;
  }

  const cursosFiltrados = cursos.filter((c) => c.nivel === activeTab);

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <GraduationCap className="h-8 w-8 text-primary" /> Mis Cursos e Interacción
        </h1>
        <p className="text-xs text-muted mt-1">
          Accede a las aulas virtuales de cada asignatura, mira los videos explicativos y descarga los PDFs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-card-border/60 gap-4 mb-2 overflow-x-auto pb-1 scrollbar-none">
        {(["Secundaria", "Preuniversitario", "Universitario"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = cursos.filter((c) => c.nivel === tab).length;
          
          let label = "";
          if (tab === "Secundaria") label = "Nivel Básico (Secundaria)";
          else if (tab === "Preuniversitario") label = "Nivel Intermedio (Preuniversitario)";
          else label = "Nivel Avanzado (Universitario)";

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-display text-sm font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-card-border/70"
              }`}
            >
              {label}
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-primary/10 text-primary-dark" : "bg-card-border/50 text-muted"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cursos Mapped */}
      {cursosFiltrados.length > 0 ? (
        <div className="flex flex-col gap-5">
          {cursosFiltrados.map((curso) => {
            const temasCurso = curso.temas || [];
            const temasCursoIds = temasCurso.map((t) => t.id_tema);
            const completadosCurso = progreso.filter(
              (p) => temasCursoIds.includes(p.id_tema) && p.completado === "TRUE"
            ).length;
            const porcentajeCurso = temasCurso.length > 0
              ? Math.round((completadosCurso / temasCurso.length) * 100)
              : 0;

            const esCursoCompletado = porcentajeCurso === 100 && temasCurso.length > 0;

            // Obtener iniciales para el monograma
            const iniciales = (curso.titulo || "Curso")
              .split(" ")
              .filter((w) => w && w.length > 2)
              .slice(0, 2)
              .map((w) => w[0] || "")
              .join("")
              .toUpperCase();

            // Círculo de progreso SVG
            const radius = 22;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (porcentajeCurso / 100) * circumference;

            return (
              <div
                key={curso.id_curso}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-card border border-card-border/75 hover:border-primary/45 rounded-xl shadow-premium hover:shadow-md transition-all gap-6 group"
              >
                {/* Lado Izquierdo: Monograma + Info */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-primary/10 via-primary/5 to-secondary/5 border border-primary/20 flex items-center justify-center font-display font-black text-primary text-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {iniciales || "C"}
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-extrabold text-primary-dark uppercase tracking-wider">
                        {curso.categoria}
                      </span>
                      {curso.carrera && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-[10px] font-extrabold text-secondary uppercase tracking-wider">
                          {curso.carrera}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                      {curso.titulo}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed line-clamp-1 max-w-xl font-medium">
                      {curso.descripcion}
                    </p>
                  </div>
                </div>

                {/* Lado Derecho: Progreso Circular SVG + Botón */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-card-border/50 pt-4 sm:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          className="stroke-card-border/55"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          className="stroke-primary transition-all duration-500"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black font-display text-primary">
                        {porcentajeCurso}%
                      </span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                        Lecciones
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {completadosCurso} de {temasCurso.length}
                      </span>
                    </div>
                  </div>

                  <Link href={`/curso/${curso.slug}`} prefetch={false}>
                    <Button
                      variant={esCursoCompletado ? "outline" : "primary"}
                      size="sm"
                      className="!rounded-full !px-5 font-bold"
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      {esCursoCompletado ? "Repasar" : "Continuar"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-card-border/60 rounded-xl text-muted text-sm font-medium">
          No tienes cursos activos en el nivel {activeTab === "Secundaria" ? "Básico" : activeTab === "Preuniversitario" ? "Intermedio" : "Avanzado"}.
        </div>
      )}
    </div>
  );
}
