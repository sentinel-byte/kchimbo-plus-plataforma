"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, Users, FolderKanban, BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Curso } from "@/lib/mock-data";

interface EstudianteData {
  id: string;
  nombre: string;
  correo: string;
  plan: string;
  fecha_registro: string;
  leccionesCompletadas: number;
}

export default function AdminDashboard() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosAdmin = async () => {
      try {
        const resCursos = await fetch("/api/cursos");
        const dataCursos = await resCursos.json();
        setCursos(dataCursos.cursos || []);

        const resEstudiantes = await fetch("/api/estudiantes");
        const dataEstudiantes = await resEstudiantes.json();
        setEstudiantes(dataEstudiantes.estudiantes || []);
      } catch (err) {
        console.error("Error cargando panel administrativo:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosAdmin();
  }, []);

  if (loading) {
    return <Loader size="md" />;
  }

  // Cálculos de métricas
  const totalCursos = cursos.length;
  const totalLecciones = cursos.reduce((acc, c) => acc + (c.temas?.length || 0), 0);
  const totalEstudiantes = estudiantes.length;

  const promedioProgreso = totalLecciones > 0 && totalEstudiantes > 0
    ? Math.round(
        (estudiantes.reduce((acc, est) => acc + est.leccionesCompletadas, 0) /
          (totalLecciones * totalEstudiantes)) *
          100
      )
    : 0;

  const metricas = [
    {
      title: "Cursos Creados",
      value: totalCursos,
      description: "Especialidades activas",
      icon: <FolderKanban className="h-6 w-6 text-primary" />,
    },
    {
      title: "Lecciones Totales",
      value: totalLecciones,
      description: "Temas estructurados",
      icon: <BookOpen className="h-6 w-6 text-primary" />,
    },
    {
      title: "Alumnos Registrados",
      value: totalEstudiantes,
      description: "Estudiantes activos",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      title: "Avance Promedio",
      value: `${promedioProgreso}%`,
      description: "Tasa de completado",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-xl bg-card border border-card-border/70 shadow-premium flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-2xl -z-10 translate-x-6 -translate-y-6" />
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          Panel de Control <span className="text-primary">Kchimbo+ Admin</span>
        </h1>
        <p className="text-sm text-muted font-medium">
          Métricas consolidadas de cursos y estudiantes. Los datos se leen directamente de Google Sheets en tiempo real.
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((m, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl bg-card border border-card-border/70 shadow-premium flex items-center justify-between gap-4 hover:border-primary/40 transition-all"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted uppercase tracking-widest">
                {m.title}
              </span>
              <span className="text-3xl font-black font-display text-foreground mt-1">
                {m.value}
              </span>
              <span className="text-xs text-muted/80 mt-0.5">{m.description}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-background border border-card-border/60 flex-shrink-0">
              {m.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Lista Rápida de Estudiantes */}
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-xl bg-card border border-card-border/70 shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-card-border/50 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Últimos Estudiantes Registrados
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Alumnos en plataforma y su avance de lecciones completadas.
              </p>
            </div>
            <Link href="/admin/estudiantes" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 cursor-pointer">
              Ver todos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {estudiantes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-card-border/50 text-xs font-bold text-muted uppercase">
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4 text-center">Lecciones Completadas</th>
                    <th className="py-3 px-4">Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 text-sm text-foreground/80">
                  {estudiantes.slice(0, 5).map((est) => (
                    <tr key={est.id} className="hover:bg-card-border/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">{est.nombre}</td>
                      <td className="py-3.5 px-4 text-muted">{est.correo}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          est.plan === "premium" ? "bg-primary/10 text-primary-dark border border-primary/20" : "bg-card-border/50 text-muted"
                        }`}>
                          {est.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-primary">
                        {est.leccionesCompletadas} / {totalLecciones}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted/80">
                        {new Date(est.fecha_registro).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted">
              No hay estudiantes registrados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
