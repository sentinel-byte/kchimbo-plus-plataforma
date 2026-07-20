"use client";

import React, { useState, useEffect } from "react";
import { FolderKanban, Plus, X, BookOpen, Trash2, Edit2, AlertCircle, ListPlus, Film, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Curso, Tema } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";

export default function AdminCursos() {
  const toast = useToast();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Formulario Modal de Curso
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Ciencias");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [nivel, setNivel] = useState<"Secundaria" | "Preuniversitario" | "Universitario">("Secundaria");
  const [carrera, setCarrera] = useState("");
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estados de Formulario Modal de Lecciones (Temas)
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  
  const [temaTitulo, setTemaTitulo] = useState("");
  const [temaOrden, setTemaOrden] = useState(1);
  const [temaDuracion, setTemaDuracion] = useState("");
  const [videoTeoriaUrl, setVideoTeoriaUrl] = useState("");
  const [videoPracticaUrl, setVideoPracticaUrl] = useState("");
  const [pdfResumenUrl, setPdfResumenUrl] = useState("");
  const [pdfTeoriaUrl, setPdfTeoriaUrl] = useState("");
  const [pdfPreguntasUrl, setPdfPreguntasUrl] = useState("");
  
  const [editingTema, setEditingTema] = useState<Tema | null>(null);
  
  const [temaFormErrors, setTemaFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingTema, setIsSubmittingTema] = useState(false);
  const [temaApiError, setTemaApiError] = useState<string | null>(null);

  const cargarCursos = async () => {
    try {
      const res = await fetch("/api/cursos");
      const data = await res.json();
      setCursos(data.cursos || []);
    } catch (err) {
      console.error("Error al cargar cursos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, []);

  const validarFormulario = () => {
    const errors: Record<string, string> = {};
    if (!titulo) errors.titulo = "El título es requerido.";
    if (!descripcion) errors.descripcion = "La descripción es requerida.";
    if (!thumbnailUrl) errors.thumbnailUrl = "La URL del thumbnail es requerida.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validarFormulario()) return;

    setIsSubmitting(true);

    try {
      const isEditing = !!editingCurso;
      const url = "/api/cursos";
      const method = isEditing ? "PUT" : "POST";
      
      const payload: any = {
        titulo,
        descripcion,
        categoria,
        thumbnail_url: thumbnailUrl,
        nivel,
        carrera: nivel === "Universitario" ? (carrera || "Medicina Humana") : undefined,
      };

      if (isEditing) {
        payload.id_curso = editingCurso.id_curso;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Ocurrió un error al ${isEditing ? "actualizar" : "registrar"} el curso.`);
      }

      // Cerrar modal y limpiar campos
      setIsModalOpen(false);
      setEditingCurso(null);
      setTitulo("");
      setDescripcion("");
      setThumbnailUrl("");
      setCategoria("Ciencias");
      setNivel("Secundaria");
      setCarrera("");
      setFormErrors({});

      // Recargar la lista de cursos
      cargarCursos();

      toast.success(
        isEditing ? "El curso ha sido actualizado de forma exitosa." : "El nuevo curso ha sido registrado de forma exitosa.",
        isEditing ? "Curso Actualizado" : "Curso Creado"
      );
    } catch (err: any) {
      const errorMsg = err.message || "Error al procesar la solicitud.";
      setApiError(errorMsg);
      toast.error(errorMsg, "Error de Curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditCurso = (curso: Curso) => {
    setEditingCurso(curso);
    setTitulo(curso.titulo);
    setDescripcion(curso.descripcion);
    setCategoria(curso.categoria);
    setThumbnailUrl(curso.thumbnail_url);
    setNivel(curso.nivel);
    setCarrera(curso.carrera || "");
    setIsModalOpen(true);
  };

  const handleEliminarCurso = async (idCurso: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este curso y todos sus temas asociados permanentemente de Google Sheets?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/cursos?idCurso=${idCurso}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar el curso.");
      }

      await cargarCursos();
      toast.success("El curso y todas sus lecciones fueron eliminados de forma permanente.", "Curso Eliminado");
    } catch (err: any) {
      const errorMsg = err.message || "Ocurrió un error al eliminar el curso.";
      toast.error(errorMsg, "Error al Eliminar");
    } finally {
      setLoading(false);
    }
  };


  // Lógica del Formulario de Temas/Lecciones
  const handleOpenManageLessons = (curso: Curso) => {
    setSelectedCurso(curso);
    setEditingTema(null);
    
    // Autocompletar el orden con base en las lecciones existentes
    const leccionesExistentes = curso.temas || [];
    setTemaOrden(leccionesExistentes.length + 1);
    
    // Limpiar campos de temas
    setTemaTitulo("");
    setTemaDuracion("");
    setVideoTeoriaUrl("");
    setVideoPracticaUrl("");
    setPdfResumenUrl("");
    setPdfTeoriaUrl("");
    setPdfPreguntasUrl("");
    setTemaFormErrors({});
    setTemaApiError(null);
    
    setIsLessonsModalOpen(true);
  };

  const handleStartEditTema = (tema: Tema) => {
    setEditingTema(tema);
    setTemaTitulo(tema.titulo);
    setTemaOrden(tema.orden);
    setTemaDuracion(tema.duracion);
    setVideoTeoriaUrl(tema.video_teoria_url);
    setVideoPracticaUrl(tema.video_practica_url || "");
    setPdfResumenUrl(tema.pdf_resumen_url || "");
    setPdfTeoriaUrl(tema.pdf_teoria_url || "");
    setPdfPreguntasUrl(tema.pdf_preguntas_url || "");
    setTemaFormErrors({});
    setTemaApiError(null);
  };

  const handleCancelEditTema = () => {
    setEditingTema(null);
    
    // Autocompletar el orden con base en las lecciones existentes
    const leccionesExistentes = selectedCurso?.temas || [];
    setTemaOrden(leccionesExistentes.length + 1);
    
    setTemaTitulo("");
    setTemaDuracion("");
    setVideoTeoriaUrl("");
    setVideoPracticaUrl("");
    setPdfResumenUrl("");
    setPdfTeoriaUrl("");
    setPdfPreguntasUrl("");
    setTemaFormErrors({});
    setTemaApiError(null);
  };

  const validarFormularioTema = () => {
    const errors: Record<string, string> = {};
    if (!temaTitulo) errors.temaTitulo = "El título de la lección es requerido.";
    if (!temaDuracion) errors.temaDuracion = "La duración es requerida (ej. 15 min).";
    if (!videoTeoriaUrl) errors.videoTeoriaUrl = "El enlace de YouTube para la teoría es requerido.";
    setTemaFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrearTema = async (e: React.FormEvent) => {
    e.preventDefault();
    setTemaApiError(null);

    if (!validarFormularioTema() || !selectedCurso) return;

    setIsSubmittingTema(true);

    try {
      const isEditing = !!editingTema;
      const url = "/api/temas";
      const method = isEditing ? "PUT" : "POST";
      
      const bodyPayload: any = {
        id_curso: selectedCurso.id_curso,
        orden: temaOrden,
        titulo: temaTitulo,
        duracion: temaDuracion,
        video_teoria_url: videoTeoriaUrl,
        video_practica_url: videoPracticaUrl || undefined,
        pdf_resumen_url: pdfResumenUrl || undefined,
        pdf_teoria_url: pdfTeoriaUrl || undefined,
        pdf_preguntas_url: pdfPreguntasUrl || undefined,
      };

      if (isEditing) {
        bodyPayload.id_tema = editingTema.id_tema;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error al ${isEditing ? "actualizar" : "registrar"} la lección.`);
      }

      const temaProcesado: Tema = data.tema;
      let temasActualizados = [];

      if (isEditing) {
        // Remplazar tema editado reactivamente
        temasActualizados = (selectedCurso.temas || []).map((t) =>
          t.id_tema === temaProcesado.id_tema ? temaProcesado : t
        );
      } else {
        // Agregar tema nuevo reactivamente
        temasActualizados = [...(selectedCurso.temas || []), temaProcesado];
      }

      // Ordenar temas por número de orden
      temasActualizados.sort((a, b) => a.orden - b.orden);

      setSelectedCurso({
        ...selectedCurso,
        temas: temasActualizados,
      });

      // Recargar lista de cursos en la tabla general
      cargarCursos();

      toast.success(
        isEditing ? "La lección ha sido actualizada de forma exitosa." : "La nueva lección ha sido guardada de forma exitosa.",
        isEditing ? "Lección Actualizada" : "Lección Guardada"
      );

      // Salir del modo edición o limpiar campos
      if (isEditing) {
        handleCancelEditTema();
      } else {
        setTemaTitulo("");
        setTemaDuracion("");
        setVideoTeoriaUrl("");
        setVideoPracticaUrl("");
        setPdfResumenUrl("");
        setPdfTeoriaUrl("");
        setPdfPreguntasUrl("");
        setTemaOrden(temasActualizados.length + 1);
        setTemaFormErrors({});
      }
    } catch (err: any) {
      const errorMsg = err.message || "Error al procesar el tema.";
      setTemaApiError(errorMsg);
      toast.error(errorMsg, "Error de Lección");
    } finally {
      setIsSubmittingTema(false);
    }
  };

  if (loading) {
    return <Loader size="md" />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <FolderKanban className="h-8 w-8 text-primary" /> Cursos Registrados
          </h1>
          <p className="text-xs text-muted mt-1">
            Gestión completa de los contenidos educativos y de la currícula de Kchimbo+.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={() => setIsModalOpen(true)}
          className="!rounded-full !px-6"
        >
          Agregar Curso
        </Button>
      </div>

      {/* Grid / Listado de Cursos */}
      <div className="p-6 rounded-xl bg-card border border-card-border/70 shadow-premium">
        {cursos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border/50 text-xs font-bold text-muted uppercase">
                  <th className="py-3 px-4">Thumbnail</th>
                  <th className="py-3 px-4">Título del Curso</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-center">Lecciones</th>
                  <th className="py-3 px-4">Nivel</th>
                  <th className="py-3 px-4">Carrera</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40 text-sm text-foreground/85">
                {cursos.map((c) => (
                  <tr key={c.id_curso} className="hover:bg-card-border/20 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-16 h-10 rounded overflow-hidden bg-background border border-card-border/60 flex-shrink-0">
                        <img src={c.thumbnail_url} alt={c.titulo} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    
                    {/* Título */}
                    <td className="py-3 px-4 font-bold text-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span>{c.titulo}</span>
                        <span className="text-[10px] text-muted font-medium line-clamp-1">{c.descripcion}</span>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3 px-4 text-muted">{c.categoria}</td>

                    {/* Lecciones */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenManageLessons(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-xs font-extrabold text-primary transition-all focus:outline-none"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {c.temas?.length || 0} lecciones
                      </button>
                    </td>

                    {/* Nivel */}
                    <td className="py-3 px-4 text-xs font-bold">{c.nivel}</td>

                    {/* Carrera */}
                    <td className="py-3 px-4 text-xs text-muted/80">
                      {c.carrera || "-"}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2 select-none">
                        <button
                          onClick={() => handleStartEditCurso(c)}
                          className="p-1.5 rounded bg-background border border-card-border hover:border-primary/50 text-muted hover:text-primary transition-all focus:outline-none"
                          title="Editar curso"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarCurso(c.id_curso)}
                          className="p-1.5 rounded bg-background border border-card-border hover:border-red-300 text-muted hover:text-red-500 transition-all focus:outline-none"
                          title="Eliminar curso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted">
            No hay cursos creados en la plataforma.
          </div>
        )}
      </div>

      {/* Modal Formulario Agregar Curso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-card rounded-xl overflow-hidden shadow-2xl border border-card-border text-foreground">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-5 border-b border-card-border/60 bg-background/50 select-none">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> {editingCurso ? "Editar Curso" : "Agregar Nuevo Curso"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCurso(null);
                  setTitulo("");
                  setDescripcion("");
                  setThumbnailUrl("");
                  setCategoria("Ciencias");
                  setNivel("Secundaria");
                  setCarrera("");
                  setFormErrors({});
                }}
                className="p-1 rounded-full hover:bg-card-border/50 text-muted hover:text-primary transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCrearCurso} className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
              {apiError && (
                <div className="p-3.5 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-1">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <span>{apiError}</span>
                </div>
              )}

              <Input
                label="Título del curso"
                type="text"
                placeholder="Ej. Anatomía General I"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (formErrors.titulo) setFormErrors({ ...formErrors, titulo: "" });
                }}
                error={formErrors.titulo}
                disabled={isSubmitting}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted select-none">
                  Descripción
                </label>
                <textarea
                  placeholder="Escribe un breve resumen de lo que el alumno aprenderá..."
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (formErrors.descripcion) setFormErrors({ ...formErrors, descripcion: "" });
                  }}
                  disabled={isSubmitting}
                  className={`flex w-full min-h-[90px] rounded-md border border-card-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted/60 ${
                    formErrors.descripcion ? "border-red-500" : ""
                  }`}
                />
                {formErrors.descripcion && (
                  <span className="text-xs text-red-500 font-medium">{formErrors.descripcion}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    disabled={isSubmitting}
                    className="flex h-11 w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="Ciencias">Ciencias</option>
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Letras">Letras</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Nivel
                  </label>
                  <select
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value as any)}
                    disabled={isSubmitting}
                    className="flex h-11 w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="Secundaria">Secundaria</option>
                    <option value="Preuniversitario">Preuniversitario</option>
                    <option value="Universitario">Universitario</option>
                  </select>
                </div>
              </div>

              {nivel === "Universitario" && (
                <Input
                  label="Carrera Universitaria"
                  type="text"
                  placeholder="Ej. Medicina Humana"
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  disabled={isSubmitting}
                />
              )}

              <Input
                label="URL del Thumbnail (Imagen)"
                type="text"
                placeholder="Ej. https://images.unsplash.com/photo-..."
                value={thumbnailUrl}
                onChange={(e) => {
                  setThumbnailUrl(e.target.value);
                  if (formErrors.thumbnailUrl) setFormErrors({ ...formErrors, thumbnailUrl: "" });
                }}
                error={formErrors.thumbnailUrl}
                disabled={isSubmitting}
              />

              <div className="flex justify-end gap-3 mt-4 border-t border-card-border/50 pt-4 select-none">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCurso(null);
                    setTitulo("");
                    setDescripcion("");
                    setThumbnailUrl("");
                    setCategoria("Ciencias");
                    setNivel("Secundaria");
                    setCarrera("");
                    setFormErrors({});
                  }}
                  disabled={isSubmitting}
                  className="!text-muted hover:!bg-card-border/30 font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  {editingCurso ? "Guardar Cambios" : "Crear Curso"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Lecciones (Temas) */}
      {isLessonsModalOpen && selectedCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-card rounded-xl overflow-hidden shadow-2xl border border-card-border text-foreground flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
            {/* Panel Izquierdo: Lista de Lecciones */}
            <div className="w-full md:w-1/2 border-r border-card-border/60 flex flex-col h-1/2 md:h-full bg-background/30">
              <div className="p-5 border-b border-card-border/60 bg-background/50 flex flex-col gap-1 select-none">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  CURSO: {selectedCurso.titulo}
                </span>
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-1.5">
                  <ListPlus className="h-5 w-5 text-primary" /> Lecciones Registradas
                </h3>
              </div>

              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3">
                {selectedCurso.temas && selectedCurso.temas.length > 0 ? (
                  selectedCurso.temas.map((tema) => (
                    <div
                      key={tema.id_tema}
                      className={`p-4 rounded-lg border transition-all select-none flex items-start justify-between gap-3 ${
                        editingTema?.id_tema === tema.id_tema
                          ? "bg-primary/5 border-primary"
                          : "bg-card border-card-border/60 hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-extrabold text-primary text-xs flex-shrink-0">
                          {tema.orden}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <h4 className="font-bold text-sm text-foreground leading-tight truncate">
                            {tema.titulo}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            <span className="font-medium">{tema.duracion}</span>
                            {tema.video_practica_url && (
                              <span className="flex items-center gap-1 font-bold text-primary/70">
                                <Film className="h-3 w-3" /> Teoría & Práctica
                              </span>
                            )}
                            {(tema.pdf_resumen_url || tema.pdf_teoria_url || tema.pdf_preguntas_url) && (
                              <span className="flex items-center gap-1 font-bold text-secondary">
                                <FileText className="h-3 w-3" /> PDF Material
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botón Editar Tema */}
                      <button
                        type="button"
                        onClick={() => handleStartEditTema(tema)}
                        className={`p-1.5 rounded transition-all focus:outline-none flex-shrink-0 ${
                          editingTema?.id_tema === tema.id_tema
                            ? "bg-primary text-white hover:bg-primary-dark"
                            : "bg-background border border-card-border hover:bg-primary/10 hover:text-primary text-muted"
                        }`}
                        title="Editar lección"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-sm text-muted font-medium flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-10 w-10 text-muted/40" />
                    <span>No hay lecciones creadas en este curso.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Derecho: Formulario para Agregar Tema */}
            <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-full">
              <div className="p-5 border-b border-card-border/60 bg-background/50 flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5 select-none">
                  {editingTema ? (
                    <>
                      <Edit2 className="h-4.5 w-4.5 text-primary" /> Editar Lección
                    </>
                  ) : (
                    "Agregar Nueva Lección"
                  )}
                </h3>
                <button
                  onClick={() => setIsLessonsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-card-border/50 text-muted hover:text-primary transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCrearTema} className="flex-1 px-6 pt-6 pb-16 flex flex-col gap-5 overflow-y-auto bg-card">
                {temaApiError && (
                  <div className="p-3.5 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-1">
                    <AlertCircle className="h-4.5 w-4.5" />
                    <span>{temaApiError}</span>
                  </div>
                )}

                <Input
                  label="Título de la lección *"
                  type="text"
                  placeholder="Ej. Introducción a las Ciencias Biológicas"
                  value={temaTitulo}
                  onChange={(e) => {
                    setTemaTitulo(e.target.value);
                    if (temaFormErrors.temaTitulo) setTemaFormErrors({ ...temaFormErrors, temaTitulo: "" });
                  }}
                  error={temaFormErrors.temaTitulo}
                  disabled={isSubmittingTema}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Orden de la lección *"
                    type="number"
                    value={temaOrden}
                    onChange={(e) => setTemaOrden(parseInt(e.target.value) || 1)}
                    disabled={isSubmittingTema}
                  />

                  <Input
                    label="Duración de la clase *"
                    type="text"
                    placeholder="Ej. 15 min"
                    value={temaDuracion}
                    onChange={(e) => {
                      setTemaDuracion(e.target.value);
                      if (temaFormErrors.temaDuracion) setTemaFormErrors({ ...temaFormErrors, temaDuracion: "" });
                    }}
                    error={temaFormErrors.temaDuracion}
                    disabled={isSubmittingTema}
                  />
                </div>

                <Input
                  label="Enlace del Video de Teoría (YouTube) *"
                  type="text"
                  placeholder="Ej. https://www.youtube.com/embed/..."
                  value={videoTeoriaUrl}
                  onChange={(e) => {
                    setVideoTeoriaUrl(e.target.value);
                    if (temaFormErrors.videoTeoriaUrl) setTemaFormErrors({ ...temaFormErrors, videoTeoriaUrl: "" });
                  }}
                  error={temaFormErrors.videoTeoriaUrl}
                  disabled={isSubmittingTema}
                />

                <Input
                  label="Enlace del Video de Práctica/Ejercicios (YouTube)"
                  type="text"
                  placeholder="Enlace opcional de resolución de problemas"
                  value={videoPracticaUrl}
                  onChange={(e) => setVideoPracticaUrl(e.target.value)}
                  disabled={isSubmittingTema}
                />

                <div className="border-t border-card-border/50 pt-5 flex flex-col gap-4">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest block">
                    Materiales de Google Drive
                  </span>

                  <Input
                    label="Enlace de Drive: PDF Resumen del Tema"
                    type="text"
                    placeholder="Enlace de previsualización o visor"
                    value={pdfResumenUrl}
                    onChange={(e) => setPdfResumenUrl(e.target.value)}
                    disabled={isSubmittingTema}
                  />

                  <Input
                    label="Enlace de Drive: PDF Teoría Completa"
                    type="text"
                    placeholder="Enlace de previsualización o visor"
                    value={pdfTeoriaUrl}
                    onChange={(e) => setPdfTeoriaUrl(e.target.value)}
                    disabled={isSubmittingTema}
                  />

                  <Input
                    label="Enlace de Drive: PDF Banco de Preguntas"
                    type="text"
                    placeholder="Enlace de previsualización o visor"
                    value={pdfPreguntasUrl}
                    onChange={(e) => setPdfPreguntasUrl(e.target.value)}
                    disabled={isSubmittingTema}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4 border-t border-card-border/50 pt-4 flex-shrink-0 select-none">
                  {editingTema ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancelEditTema}
                        disabled={isSubmittingTema}
                        className="!text-muted hover:!bg-card-border/30 font-bold"
                      >
                        Cancelar Edición
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmittingTema}
                      >
                        Guardar Cambios
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsLessonsModalOpen(false)}
                        disabled={isSubmittingTema}
                        className="!text-muted hover:!bg-card-border/30"
                      >
                        Cerrar
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmittingTema}
                      >
                        Guardar Lección
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
