"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Trophy, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { FallbackBackground } from "@/components/landing/FallbackBackground";
import { MOCK_CURSOS } from "@/lib/mock-data";

export default function Home() {
  const cursosDestacados = MOCK_CURSOS.slice(0, 3);

  const propuestaValor = [
    {
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      title: "Enfoque Pre & Universitario",
      description: "Contenido diseñado específicamente para asegurar tu ingreso y dominar los primeros ciclos de medicina humana, ingeniería civil y otras carreras.",
    },
    {
      icon: <Trophy className="h-6 w-6 text-primary" />,
      title: "Línea de Tiempo Dinámica",
      description: "Visualiza la currícula completa de anatomía, física o matemáticas en una línea de tiempo secuencial interactiva.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Seguimiento Continuo",
      description: "Visualiza tu avance por lección, mantén tus notas y controla tu velocidad de aprendizaje en un solo lugar.",
    },
  ];

  const testimonios = [
    {
      quote: "La línea de tiempo interactiva de Anatomía Humana en Kchimbo+ me salvó en mi primer ciclo de Medicina Humana. Estudiar miología y esplacnología paso a paso es una experiencia de otro nivel.",
      author: "Carlos Mendoza",
      role: "Estudiante de Medicina - UNMSM",
    },
    {
      quote: "Las clases de Resistencia de Materiales y Cálculo de Kchimbo+ me ayudaron a entender la física aplicada en Ingeniería Civil mucho mejor que en las clases tradicionales.",
      author: "Luis Fernando Rivas",
      role: "Estudiante de Ingeniería Civil - UNI",
    },
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-start pt-36 pb-24 lg:pt-48 lg:pb-36 overflow-hidden">
        {/* Fondo 2D interactivo con paralaje y partículas */}
        <FallbackBackground />

        <div className="max-w-7xl w-full mx-auto px-6 z-10 flex flex-col items-center lg:items-start text-center lg:text-left lg:pl-12">
          {/* Subtítulo Premium */}
          <span className="text-[11px] font-bold tracking-[0.35em] text-primary uppercase mb-5 block select-none">
            Educación Universitaria Avanzada
          </span>

          {/* Título Asimétrico con Gradiente Fluido */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.95] mb-8 text-foreground max-w-4xl">
            La forma inteligente de <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">dominar tu carrera.</span>
          </h1>

          {/* Copio Conceptual */}
          <p className="text-base sm:text-lg lg:text-xl text-muted max-w-2xl lg:max-w-xl mb-12 leading-relaxed font-medium">
            Kchimbo+ organiza tu preparación preuniversitaria y universitaria de Medicina Humana, Ingeniería Civil y más especialidades en una línea de tiempo interactiva. Estudia a tu propio ritmo y asegura tu ingreso.
          </p>

          {/* CTAs Principales */}
          <div className="flex flex-col sm:flex-row items-center lg:justify-start gap-4 w-full sm:w-auto">
            <Link href="/login" prefetch={false} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto !rounded-full !px-8 !py-4.5 font-bold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Ingresar al Aula Virtual
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/registro" prefetch={false} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto !rounded-full !px-8 !py-4.5 font-bold border-card-border hover:border-primary/30 transition-all duration-300 flex items-center justify-center"
              >
                Registrarse Gratis
              </Button>
            </Link>
          </div>
        </div>

        {/* Gradiente decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* Metodología Kchimbo+ (Propuesta de Valor) */}
      <section className="py-28 bg-card border-t border-b border-card-border/40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/5 rounded-full filter blur-[150px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase mb-3.5 block">
              NUESTRO METODO
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-5 text-foreground leading-tight">
              Preparación de alto nivel diseñada para destacar.
            </h2>
            <p className="text-muted font-medium text-base sm:text-lg">
              Nuestra plataforma te brinda las herramientas pedagógicas y tecnológicas que las aulas tradicionales pasan por alto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {propuestaValor.map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-background border border-card-border/75 shadow-premium hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Especialidades Biomédicas (Showcase Cursos) */}
      <section id="cursos-showcase" className="py-28 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase mb-3.5 block">
                EXPLORA CURSOS
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                Niveles: Secundaria, Pre y Universitario.
              </h2>
            </div>
            <Link href="/login" prefetch={false}>
              <Button
                variant="outline"
                className="!rounded-full !px-6 border-card-border hover:border-primary/30 transition-colors"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Acceder al Aula Virtual
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cursosDestacados.map((curso) => {
              // Iniciales para el monograma minimalista
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
                  className="rounded-2xl overflow-hidden bg-card border border-card-border/75 shadow-premium hover:border-primary/45 hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  {/* Monograma */}
                  <div className="h-48 bg-gradient-to-tr from-primary/10 via-primary/5 to-secondary/5 border-b border-card-border/60 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <span className="font-display font-black text-primary text-5xl select-none group-hover:scale-105 transition-transform duration-500">
                      {iniciales}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-background/95 backdrop-blur-sm text-[9px] font-bold text-primary-dark uppercase tracking-wider border border-card-border/60">
                        {curso.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-8 flex-1 flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-2.5">
                      <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {curso.titulo}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed line-clamp-2 font-medium">
                        {curso.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-card-border/50">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider">
                          Nivel {curso.nivel}
                        </span>
                        {curso.carrera && (
                          <span className="text-[10px] text-primary-dark font-extrabold uppercase tracking-wider mt-0.5">
                            {curso.carrera}
                          </span>
                        )}
                      </div>
                      <Link href="/login" prefetch={false}>
                        <span className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 cursor-pointer">
                          Acceder <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Voces de la Comunidad (Testimonios) */}
      <section className="py-28 bg-card border-t border-b border-card-border/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase mb-3.5 block">
              TESTIMONIOS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              Respaldado por futuros profesionales de éxito.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonios.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-background border border-card-border/75 shadow-premium hover:border-primary/30 transition-all duration-300 flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-base sm:text-lg text-foreground/85 leading-relaxed font-medium italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-foreground">{t.author}</span>
                  <span className="text-sm text-muted font-medium mt-0.5">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-28 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-primary/10 rounded-full filter blur-[180px] -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase select-none">
            COMIENZA HOY
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.05]">
            ¿Listo para dominar las ciencias y tu carrera?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted max-w-xl leading-relaxed font-medium">
            Ingresa a Kchimbo+ y obtén acceso a la currícula interactiva de medicina, ingeniería civil y más especialidades de mayor nivel del país.
          </p>
          <div className="flex justify-center w-full mt-4">
            <Link href="/login" prefetch={false} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto !rounded-full !px-12 !py-5 font-bold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-98 transition-all duration-300"
              >
                Acceder al Aula Virtual
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
