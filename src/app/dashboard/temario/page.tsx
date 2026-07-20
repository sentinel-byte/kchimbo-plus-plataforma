"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, BookOpen, ChevronRight, Hash } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { Curso } from "@/lib/mock-data";

export default function TemarioDashboard() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Secundaria" | "Preuniversitario" | "Universitario">("Preuniversitario");

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const res = await fetch("/api/cursos");
        const data = await res.json();
        setCursos(data.cursos || []);
      } catch (err) {
        console.error("Error al cargar temario:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarCursos();
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
          <ClipboardList className="h-8 w-8 text-primary" /> Temario Académico
        </h1>
        <p className="text-xs text-muted mt-1">
          Visualiza la estructura completa de los temas y contenidos programáticos de cada curso sin interacción.
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

      {/* Temario Mapped */}
      {cursosFiltrados.length > 0 ? (
        <div className="flex flex-col gap-8">
          {cursosFiltrados.map((curso) => {
            const temas = curso.temas || [];
            
            // Obtener iniciales para el monograma
            const iniciales = (curso.titulo || "Curso")
              .split(" ")
              .filter((w) => w && w.length > 2)
              .slice(0, 2)
              .map((w) => w[0] || "")
              .join("")
              .toUpperCase();

            return (
              <div
                key={curso.id_curso}
                className="bg-card border border-card-border/60 rounded-xl p-5 shadow-premium flex flex-col gap-4"
              >
                {/* Cabecera del Curso */}
                <div className="flex items-center gap-3 border-b border-card-border/40 pb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary/10 via-primary/5 to-secondary/5 border border-primary/20 flex items-center justify-center font-display font-black text-primary text-sm">
                    {iniciales || "C"}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-extrabold text-primary-dark uppercase tracking-wider">
                        {curso.categoria}
                      </span>
                      {curso.carrera && (
                        <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-[8px] font-extrabold text-secondary uppercase tracking-wider">
                          {curso.carrera}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {curso.titulo}
                    </h3>
                  </div>
                </div>

                {/* Lista de temas - Fila única */}
                {temas.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {temas.map((tema) => (
                      <div
                        key={tema.id_tema}
                        className="flex items-center justify-between p-3 px-4 rounded-lg bg-background border border-card-border/40 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-card-border/35 border border-card-border/50 flex items-center justify-center font-bold text-[10px] text-muted flex-shrink-0">
                            {tema.orden}
                          </div>
                          <span className="text-sm font-semibold text-foreground/90 truncate">
                            {tema.titulo}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted font-bold whitespace-nowrap ml-4">
                          {tema.duracion}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted font-medium bg-background rounded-xl border border-dashed border-card-border">
                    No hay lecciones registradas para este curso.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-card-border/60 rounded-xl text-muted text-sm font-medium">
          No hay cursos temarios en el nivel {activeTab === "Secundaria" ? "Básico" : activeTab === "Preuniversitario" ? "Intermedio" : "Avanzado"}.
        </div>
      )}
    </div>
  );
}
