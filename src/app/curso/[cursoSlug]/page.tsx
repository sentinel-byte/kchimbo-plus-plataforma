"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Lock, Play, CheckCircle2, ChevronRight, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Curso, Tema } from "@/lib/mock-data";
import { SheetProgreso } from "@/lib/google-sheets";

export default function CursoDetalle() {
  const params = useParams();
  const router = useRouter();
  const cursoSlug = params.cursoSlug as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [progreso, setProgreso] = useState<SheetProgreso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCursoYProgreso = async () => {
      try {
        // Antes: se esperaba la respuesta de /api/cursos y RECIÉN DESPUÉS se pedía
        // /api/progreso (waterfall secuencial). Como ambas peticiones son independientes,
        // las lanzamos en paralelo con Promise.all — corta el tiempo de carga casi a la mitad.
        const [resCursos, resProgreso] = await Promise.all([
          fetch("/api/cursos"),
          fetch("/api/progreso"),
        ]);

        const dataCursos = await resCursos.json();
        const todosCursos = dataCursos.cursos || [];
        const cursoEncontrado = todosCursos.find((c: Curso) => c.slug === cursoSlug);

        if (!cursoEncontrado) {
          router.push("/dashboard");
          return;
        }

        setCurso(cursoEncontrado);

        const dataProgreso = await resProgreso.json();
        setProgreso(dataProgreso.progreso || []);
      } catch (err) {
        console.error("Error al cargar detalles del curso:", err);
      } finally {
        setLoading(false);
      }
    };

    if (cursoSlug) {
      cargarCursoYProgreso();
    }
  }, [cursoSlug, router]);

  if (loading) {
    return <Loader size="md" />;
  }

  if (!curso) {
    return null;
  }

  const temas = curso.temas || [];

  // Determinar estados y verificar secuencialidad
  const temasConEstado = temas.map((tema, index) => {
    const estaCompletado = progreso.some(
      (p) => p.id_tema === tema.id_tema && p.completado === "TRUE"
    );

    let estaDisponible = false;
    if (index === 0) {
      estaDisponible = true; // El primer tema siempre está disponible
    } else {
      // El tema actual está disponible si el anterior está completado
      const temaAnterior = temas[index - 1];
      const anteriorCompletado = progreso.some(
        (p) => p.id_tema === temaAnterior.id_tema && p.completado === "TRUE"
      );
      estaDisponible = anteriorCompletado || estaCompletado;
    }

    const estado: "bloqueado" | "disponible" | "completado" = estaCompletado
      ? "completado"
      : estaDisponible
      ? "disponible"
      : "bloqueado";

    return { ...tema, estado };
  });

  // Calcular métricas
  const totalLecciones = temas.length;
  const leccionesCompletadas = temasConEstado.filter((t) => t.estado === "completado").length;
  const porcentajeCurso = totalLecciones > 0 ? Math.round((leccionesCompletadas / totalLecciones) * 100) : 0;

  // Calcular el progreso visual de la línea conector
  // index del último tema completado
  const ultimoCompletadoIdx = temasConEstado.map(t => t.estado === "completado").lastIndexOf(true);
  const porcentajeLinea = totalLecciones > 1
    ? (ultimoCompletadoIdx / (totalLecciones - 1)) * 100
    : leccionesCompletadas === 1 ? 100 : 0;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Botón Volver Contextual */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver a Mis Cursos
        </Link>
      </div>

      {/* Cabecera del Curso */}
      <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl bg-card border border-card-border shadow-premium relative overflow-hidden">
        {/* Thumbnail del curso en miniatura lateral */}
        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img src={curso.thumbnail_url} alt={curso.titulo} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-primary/10 text-[10px] font-bold text-primary-dark uppercase tracking-wider">
                {curso.categoria}
              </span>
              <span className="text-xs text-muted font-bold uppercase">Nivel {curso.nivel}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {curso.titulo}
            </h1>
            <p className="text-sm text-muted font-medium leading-relaxed max-w-3xl">
              {curso.descripcion}
            </p>
          </div>

          {/* Barra de progreso persistente del curso */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-card-border/50">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-muted uppercase">Progreso del curso:</span>
              <span className="text-sm font-black text-primary font-display">{porcentajeCurso}%</span>
            </div>
            <div className="flex-1 w-full h-2 bg-background border border-card-border/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${porcentajeCurso}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted flex-shrink-0">
              {leccionesCompletadas} de {totalLecciones} completadas
            </span>
          </div>
        </div>
      </div>

      {/* Línea de tiempo interactiva */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight mb-1">
            Línea de Tiempo del Recorrido
          </h2>
          <p className="text-xs text-muted font-medium">
            Completa cada lección en orden para desbloquear la siguiente y colorear tu ruta académica.
          </p>
        </div>

        <div className="p-6 md:p-10 rounded-xl bg-card border border-card-border shadow-premium overflow-x-auto">
          {/* 
            CONTENEDOR DE LA LÍNEA DE TIEMPO RESPONSIVE:
            - Móvil: Horizontal (scroll horizontal)
            - Desktop: Vertical
          */}
          
          {/* DESKTOP VIEW (Línea de tiempo vertical) */}
          <div className="hidden md:flex flex-col relative pl-12 pr-4 min-h-[400px]">
            {/* Conector general gris (línea de fondo) */}
            <div className="absolute left-[30px] top-4 bottom-4 w-0.5 bg-card-border/80" />
            
            {/* Conector naranja activo (progreso coloreado) */}
            <div
              className="absolute left-[30px] top-4 w-0.5 bg-primary transition-all duration-500"
              style={{
                height: `${porcentajeLinea}%`,
                maxHeight: "calc(100% - 32px)",
              }}
            />

            {/* Elementos de la línea de tiempo */}
            <div className="flex flex-col gap-10">
              {temasConEstado.map((tema, index) => {
                const esCompletado = tema.estado === "completado";
                const esDisponible = tema.estado === "disponible";
                const esBloqueado = tema.estado === "bloqueado";

                return (
                  <div key={tema.id_tema} className="relative flex items-start gap-6 group">
                    {/* Indicador de punto en la línea de tiempo */}
                    <div className="absolute left-[-30px] -translate-x-1/2 top-1.5 z-10 flex items-center justify-center">
                      {esCompletado ? (
                        <div className="w-6 h-6 rounded-full bg-primary border-4 border-card flex items-center justify-center shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      ) : esDisponible ? (
                        <div className="w-6 h-6 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-sm animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-card border-4 border-card-border/60 flex items-center justify-center shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-card-border/60" />
                        </div>
                      )}
                    </div>

                    {/* Tarjeta de tema */}
                    <div
                      className={`flex-1 p-5 rounded-lg border transition-all ${
                        esBloqueado
                          ? "bg-background/40 border-card-border/30 opacity-60 pointer-events-none"
                          : "bg-background border-card-border/60 hover:border-primary/40 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          {/* Número / Icono */}
                          <div className={`p-2.5 rounded-md flex-shrink-0 flex items-center justify-center ${
                            esCompletado ? "bg-primary/10 text-primary" : "bg-card-border/30 text-muted"
                          }`}>
                            {esCompletado ? <CheckCircle2 className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                              Lección {tema.orden}
                            </span>
                            <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                              {tema.titulo}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-muted font-medium mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {tema.duracion}
                              </span>
                              {tema.material_url && (
                                <span className="text-primary-dark font-semibold">Tiene material</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CTA Acceso */}
                        {!esBloqueado && (
                          <Link href={`/curso/${curso.slug}/tema/${tema.slug}`}>
                            <Button variant={esCompletado ? "outline" : "primary"} size="sm">
                              {esCompletado ? "Repasar" : "Empezar"}
                            </Button>
                          </Link>
                        )}
                        {esBloqueado && (
                          <div className="p-2 rounded bg-card-border/20 text-muted">
                            <Lock className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MOBILE VIEW (Línea de tiempo horizontal con scroll) */}
          <div className="md:hidden flex flex-row relative items-start min-w-[700px] py-6 px-4">
            {/* Conector general gris (línea de fondo) */}
            <div className="absolute left-6 right-6 top-[34px] h-0.5 bg-card-border/80" />
            
            {/* Conector naranja activo (progreso coloreado) */}
            <div
              className="absolute left-6 top-[34px] h-0.5 bg-primary transition-all duration-500"
              style={{
                width: `${porcentajeLinea}%`,
                maxWidth: "calc(100% - 48px)",
              }}
            />

            {/* Elementos de la línea de tiempo */}
            <div className="flex justify-between w-full">
              {temasConEstado.map((tema, index) => {
                const esCompletado = tema.estado === "completado";
                const esDisponible = tema.estado === "disponible";
                const esBloqueado = tema.estado === "bloqueado";

                return (
                  <div key={tema.id_tema} className="flex flex-col items-center text-center w-48 px-2 relative">
                    {/* Indicador de punto en la línea de tiempo */}
                    <div className="mb-4 z-10 flex items-center justify-center">
                      {esCompletado ? (
                        <div className="w-6 h-6 rounded-full bg-primary border-4 border-card flex items-center justify-center shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      ) : esDisponible ? (
                        <div className="w-6 h-6 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-sm animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-card border-4 border-card-border/60 flex items-center justify-center shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-card-border/60" />
                        </div>
                      )}
                    </div>

                    {/* Tarjeta de tema */}
                    <div
                      className={`p-4 rounded-lg border w-full flex flex-col items-center gap-3 transition-all ${
                        esBloqueado
                          ? "bg-background/40 border-card-border/30 opacity-60 pointer-events-none"
                          : "bg-background border-card-border/60 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
                          Lección {tema.orden}
                        </span>
                        <h3 className="font-display font-bold text-xs text-foreground line-clamp-2 min-h-[32px]">
                          {tema.titulo}
                        </h3>
                        <span className="text-[10px] text-muted font-medium mt-1">
                          {tema.duracion}
                        </span>
                      </div>

                      {/* CTA Acceso */}
                      {!esBloqueado ? (
                        <Link href={`/curso/${curso.slug}/tema/${tema.slug}`} className="w-full">
                          <Button variant={esCompletado ? "outline" : "primary"} size="sm" className="w-full !h-8 !text-[11px] !px-2">
                            {esCompletado ? "Repasar" : "Empezar"}
                          </Button>
                        </Link>
                      ) : (
                        <div className="p-1 rounded bg-card-border/20 text-muted">
                          <Lock className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
