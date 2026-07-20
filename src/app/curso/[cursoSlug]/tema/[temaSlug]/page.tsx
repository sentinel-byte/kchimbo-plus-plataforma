"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Award, ExternalLink, Play, Sparkles, BookOpen, X, FileText, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Curso, Tema } from "@/lib/mock-data";
import { SheetProgreso } from "@/lib/google-sheets";
import { useToast } from "@/components/ui/Toast";

export default function TemaDetalle() {
  const toast = useToast();
  const params = useParams();
  const router = useRouter();
  const cursoSlug = params.cursoSlug as string;
  const temaSlug = params.temaSlug as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [tema, setTema] = useState<Tema | null>(null);
  const [progreso, setProgreso] = useState<SheetProgreso[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados del reproductor alternable de videos
  const [activeVideo, setActiveVideo] = useState<"teoria" | "practica">("teoria");

  // Estados del visualizador de PDF incrustado
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar todos los cursos
        const resCursos = await fetch("/api/cursos");
        const dataCursos = await resCursos.json();
        const todosCursos = dataCursos.cursos || [];
        const cursoEncontrado = todosCursos.find((c: Curso) => c.slug === cursoSlug);

        if (!cursoEncontrado) {
          router.push("/dashboard");
          return;
        }

        setCurso(cursoEncontrado);

        // Buscar el tema
        const temasCurso = cursoEncontrado.temas || [];
        const temaEncontrado = temasCurso.find((t: Tema) => t.slug === temaSlug);

        if (!temaEncontrado) {
          router.push(`/curso/${cursoSlug}`);
          return;
        }

        setTema(temaEncontrado);

        // Cargar progreso
        const resProgreso = await fetch("/api/progreso");
        const dataProgreso = await resProgreso.json();
        setProgreso(dataProgreso.progreso || []);
      } catch (err) {
        console.error("Error al cargar detalles de la lección:", err);
      } finally {
        setLoading(false);
      }
    };

    if (cursoSlug && temaSlug) {
      cargarDatos();
    }
  }, [cursoSlug, temaSlug, router]);

  if (loading) {
    return <Loader size="md" />;
  }

  if (!curso || !tema) {
    return null;
  }

  const estaCompletado = progreso.some(
    (p) => p.id_tema === tema.id_tema && p.completado === "TRUE"
  );

  const handleMarcarCompletado = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCurso: curso.id_curso,
          idTema: tema.id_tema,
          completado: true,
        }),
      });

      if (res.ok) {
        toast.success("¡Felicidades! Has completado esta lección de forma exitosa.", "Progreso Guardado");
        router.push(`/curso/${curso.slug}`);
      } else {
        throw new Error("No se pudo guardar el progreso.");
      }
    } catch (err) {
      console.error("Error al actualizar progreso:", err);
      toast.error("Ocurrió un error al guardar tu progreso de lección.", "Error de Progreso");
    } finally {
      setIsUpdating(false);
    }
  };

  // Convertir URL de YouTube normal a URL embed si es necesario
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    return url;
  };

  // Extraer ID de Drive y construir URL de previsualización para el iframe
  const getEmbedPdfUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  // Extraer ID de Drive y construir URL de descarga directa automática para el botón Descargar
  const getDirectDownloadPdfUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.usercontent.google.com/u/0/uc?id=${match[1]}&export=download`;
      }
    }
    return url;
  };

  // Abrir visor de PDF
  const handleOpenPdf = (url: string, tituloMaterial: string) => {
    setPdfUrl(url);
    setPdfTitle(tituloMaterial);
    setIsPdfModalOpen(true);
  };

  // Obtener la siguiente lección si existe
  const temas = curso.temas || [];
  const indexActual = temas.findIndex((t) => t.id_tema === tema.id_tema);
  const siguienteTema = indexActual < temas.length - 1 ? temas[indexActual + 1] : null;

  // Video actualmente seleccionado en las pestañas
  const videoUrlActual = activeVideo === "teoria" 
    ? tema.video_teoria_url 
    : (tema.video_practica_url || tema.video_teoria_url);

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      {/* Botón Volver Contextual */}
      <div>
        <Link
          href={`/curso/${curso.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver al Curso
        </Link>
      </div>

      {/* Grid Contenedor (Video + Información) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado izquierdo: Reproductor y Materiales (2/3 de ancho) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Alternador de Videos y Reproductor */}
          <div className="flex flex-col gap-3">
            {tema.video_practica_url && (
              <div className="flex border-b border-card-border/50 gap-4 pb-1 select-none">
                <button
                  onClick={() => setActiveVideo("teoria")}
                  className={`pb-2 px-1 border-b-2 font-display text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
                    activeVideo === "teoria"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  📺 Clase Teórica
                </button>
                <button
                  onClick={() => setActiveVideo("practica")}
                  className={`pb-2 px-1 border-b-2 font-display text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
                    activeVideo === "practica"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  ✏️ Resolución de Ejercicios
                </button>
              </div>
            )}

            {/* Contenedor Aspect Ratio para Video (16:9) */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-premium border border-card-border">
              <iframe
                src={`${getEmbedVideoUrl(videoUrlActual)}?autoplay=0`}
                title={tema.titulo}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Detalles de la Lección */}
          <div className="p-6 rounded-xl bg-card border border-card-border shadow-premium flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-primary/10 text-[10px] font-bold text-primary-dark uppercase tracking-wider">
                Lección {tema.orden}
              </span>
              <span className="text-xs text-muted font-bold uppercase">{tema.duracion}</span>
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
              {tema.titulo}
            </h1>
            <p className="text-sm text-muted font-medium leading-relaxed">
              En esta clase interactiva tienes a tu disposición explicaciones grabadas y material en PDF diseñado por el tutor para consolidar tus conocimientos. Utiliza el visualizador de abajo para leer las lecturas recomendadas sin salir del aula virtual.
            </p>
          </div>

          {/* Sección de Recursos Descargables y Visualizables */}
          {(tema.pdf_resumen_url || tema.pdf_teoria_url || tema.pdf_preguntas_url) && (
            <div className="flex flex-col gap-4.5">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Recursos de Estudio Descargables
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recurso 1: Resumen del Tema */}
                {tema.pdf_resumen_url && (
                  <div className="p-5 rounded-xl bg-card border border-card-border/70 hover:border-primary/30 transition-all flex flex-col justify-between gap-4 shadow-sm group">
                    <div className="flex flex-col gap-2">
                      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Resumen del Tema</h4>
                      <p className="text-xs text-muted font-medium leading-relaxed">
                        Esquema y conceptos clave del tema sintetizados en una página.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPdf(tema.pdf_resumen_url!, "Resumen del Tema")}
                      className="!w-full !rounded-lg !text-xs !py-2 !px-3 border border-card-border hover:border-primary/30 font-bold flex items-center justify-center gap-1.5 hover:!bg-primary/5 hover:!text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" /> Leer en Aula
                    </Button>
                  </div>
                )}

                {/* Recurso 2: Teoría Completa */}
                {tema.pdf_teoria_url && (
                  <div className="p-5 rounded-xl bg-card border border-card-border/70 hover:border-primary/30 transition-all flex flex-col justify-between gap-4 shadow-sm group">
                    <div className="flex flex-col gap-2">
                      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Teoría Completa</h4>
                      <p className="text-xs text-muted font-medium leading-relaxed">
                        Libro guía con el contenido teórico extenso y desarrollado.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPdf(tema.pdf_teoria_url!, "Teoría Completa")}
                      className="!w-full !rounded-lg !text-xs !py-2 !px-3 border border-card-border hover:border-primary/30 font-bold flex items-center justify-center gap-1.5 hover:!bg-primary/5 hover:!text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" /> Leer en Aula
                    </Button>
                  </div>
                )}

                {/* Recurso 3: Banco de Preguntas */}
                {tema.pdf_preguntas_url && (
                  <div className="p-5 rounded-xl bg-card border border-card-border/70 hover:border-primary/30 transition-all flex flex-col justify-between gap-4 shadow-sm group">
                    <div className="flex flex-col gap-2">
                      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Banco de Preguntas</h4>
                      <p className="text-xs text-muted font-medium leading-relaxed">
                        Autoevaluación con preguntas y ejercicios para practicar.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPdf(tema.pdf_preguntas_url!, "Banco de Preguntas")}
                      className="!w-full !rounded-lg !text-xs !py-2 !px-3 border border-card-border hover:border-primary/30 font-bold flex items-center justify-center gap-1.5 hover:!bg-primary/5 hover:!text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" /> Leer en Aula
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lado derecho: Acciones y Progreso (1/3 de ancho) */}
        <div className="flex flex-col gap-6">
          
          {/* Tarjeta de Acciones */}
          <div className="p-6 rounded-xl bg-card border border-card-border shadow-premium flex flex-col gap-6">
            <h3 className="font-display font-bold text-base border-b border-card-border/50 pb-3">
              Progreso de la Clase
            </h3>

            {estaCompletado ? (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex flex-col items-center gap-3 text-center">
                <div className="p-2.5 rounded-full bg-green-100 text-green-600">
                  <Award className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-green-800">¡Lección Completada!</span>
                  <span className="text-xs text-green-700">Ya has coloreado este punto en tu recorrido.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center gap-3 text-center">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary animate-pulse">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-foreground">Clase en Curso</span>
                  <span className="text-xs text-muted font-medium">Marca esta lección como completada para desbloquear la siguiente.</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!estaCompletado && (
                <Button
                  variant="primary"
                  className="w-full"
                  isLoading={isUpdating}
                  leftIcon={<CheckCircle2 className="h-5 w-5" />}
                  onClick={handleMarcarCompletado}
                >
                  Marcar como completado
                </Button>
              )}

              {siguienteTema && (
                <Link href={`/curso/${curso.slug}/tema/${siguienteTema.slug}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Siguiente lección
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Visualizador de PDF Integrado de Google Drive */}
      {isPdfModalOpen && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-5xl h-[85vh] bg-card border border-card-border/60 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header del Visualizador */}
            <div className="flex items-center justify-between p-5 md:p-6 pb-4 border-b border-card-border/60 bg-background/50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mb-1">
                  Lector Integrado Kchimbo+
                </span>
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-primary" /> {pdfTitle} &bull; {tema.titulo}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={getDirectDownloadPdfUrl(pdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-background border border-card-border hover:border-primary/40 text-xs font-bold text-foreground hover:text-primary transition-all focus:outline-none"
                  title="Descargar archivo directamente"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar
                </a>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-2 rounded-full hover:bg-card-border/55 text-muted hover:text-primary transition-all focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Iframe del Visualizador de Google Drive */}
            <div className="flex-1 w-full bg-background relative overflow-hidden">
              <iframe
                src={getEmbedPdfUrl(pdfUrl)}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
