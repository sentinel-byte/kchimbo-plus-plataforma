"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Calendar, ShieldCheck, X, Check, Mail, User } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface EstudianteData {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  username: string;
  correo: string;
  plan: string;
  estado_cuenta: "trial" | "activo" | "expirado" | "bloqueado";
  fecha_registro: string;
  fecha_inicio_membresia: string | null;
  fecha_fin_membresia: string | null;
  leccionesCompletadas: number;
}

export default function AdminEstudiantes() {
  const toast = useToast();
  const [estudiantes, setEstudiantes] = useState<EstudianteData[]>([]);
  const [totalLecciones, setTotalLecciones] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados del Modal de Habilitación
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estadoCuenta, setEstadoCuenta] = useState<"trial" | "activo" | "expirado" | "bloqueado">("activo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarEstudiantes = async () => {
    try {
      const resCursos = await fetch("/api/cursos");
      const dataCursos = await resCursos.json();
      const todosCursos = dataCursos.cursos || [];
      const lecciones = todosCursos.reduce((acc: number, c: any) => acc + (c.temas?.length || 0), 0);
      setTotalLecciones(lecciones);

      const res = await fetch("/api/estudiantes");
      const data = await res.json();
      setEstudiantes(data.estudiantes || []);
    } catch (err) {
      console.error("Error al cargar estudiantes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const handleOpenActivar = (est: EstudianteData) => {
    setSelectedEstudiante(est);
    
    // Por defecto hoy y hoy + 1 año para membresía
    const hoy = new Date();
    const unAnioDespues = new Date();
    unAnioDespues.setFullYear(hoy.getFullYear() + 1);

    const formatFecha = (d: Date) => d.toISOString().split("T")[0];

    setFechaInicio(est.fecha_inicio_membresia ? est.fecha_inicio_membresia.split("T")[0] : formatFecha(hoy));
    setFechaFin(est.fecha_fin_membresia ? est.fecha_fin_membresia.split("T")[0] : formatFecha(unAnioDespues));
    setEstadoCuenta(est.estado_cuenta || "activo");
    setIsModalOpen(true);
  };

  const handleGuardarAcceso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstudiante) return;

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio.", "Rango de Fechas Inválido");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/estudiantes/activar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: selectedEstudiante.id,
          fecha_inicio: new Date(fechaInicio).toISOString(),
          fecha_fin: new Date(fechaFin).toISOString(),
          estado_cuenta: estadoCuenta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al actualizar los accesos.");
      }

      toast.success(
        `Se han actualizado los accesos del estudiante ${selectedEstudiante.nombre} correctamente.`,
        "Cuenta Habilitada"
      );

      setIsModalOpen(false);
      setSelectedEstudiante(null);
      await cargarEstudiantes();
    } catch (err: any) {
      toast.error(err.message || "Error al activar el estudiante.", "Error de Activación");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader size="md" />;
  }

  const estudiantesFiltrados = estudiantes.filter(
    (est) =>
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.dni?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <Users className="h-8 w-8 text-primary" /> Estudiantes Registrados
        </h1>
        <p className="text-xs text-muted mt-1">
          Visualiza a los usuarios en la plataforma y controla la activación y vigencia de sus membresías.
        </p>
      </div>

      {/* Caja de Filtros */}
      <div className="p-6 rounded-xl bg-card border border-card-border/70 shadow-premium flex items-center justify-between gap-4 select-none">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-md border border-card-border bg-background text-sm text-foreground placeholder:text-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
          />
        </div>

        <div className="text-xs text-muted font-bold uppercase tracking-wider">
          Total: {estudiantesFiltrados.length} Estudiantes
        </div>
      </div>

      {/* Tabla Completa de Estudiantes */}
      <div className="p-6 rounded-xl bg-card border border-card-border/70 shadow-premium">
        {estudiantesFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border/50 text-xs font-bold text-muted uppercase">
                  <th className="py-3 px-4">Estudiante / DNI</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Avance en Clases</th>
                  <th className="py-3 px-4">Membresía (Inicio / Fin)</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40 text-sm text-foreground/80">
                {estudiantesFiltrados.map((est) => {
                  const avancePorcentaje = totalLecciones > 0
                    ? Math.round((est.leccionesCompletadas / totalLecciones) * 100)
                    : 0;

                  // Render de badges de estado
                  let badgeColor = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
                  if (est.estado_cuenta === "activo") {
                    badgeColor = "bg-green-500/10 text-green-600 border border-green-500/20";
                  } else if (est.estado_cuenta === "expirado") {
                    badgeColor = "bg-red-500/10 text-red-500 border border-red-500/20";
                  } else if (est.estado_cuenta === "bloqueado") {
                    badgeColor = "bg-gray-500/10 text-gray-500 border border-gray-500/20";
                  }

                  const formatFecha = (fStr: string | null) => {
                    if (!fStr) return "-";
                    return new Date(fStr).toLocaleDateString("es-ES", {
                      dateStyle: "short",
                    });
                  };

                  return (
                    <tr key={est.id} className="hover:bg-card-border/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-foreground">
                        <div className="flex flex-col gap-0.5">
                          <span>{est.nombre} {est.apellidos}</span>
                          <span className="text-[10px] text-muted font-bold">DNI: {est.dni || "Sin registrar"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span>@{est.username || "sin_usuario"}</span>
                          <span className="text-[10px] text-muted/70">{est.correo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${badgeColor}`}>
                          {est.estado_cuenta || "trial"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-primary text-xs">
                            {est.leccionesCompletadas} / {totalLecciones} ({avancePorcentaje}%)
                          </span>
                          <div className="w-24 h-1 bg-background rounded-full overflow-hidden border border-card-border/50">
                            <div className="h-full bg-primary" style={{ width: `${avancePorcentaje}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-muted">
                        <div className="flex flex-col gap-0.5">
                          <span>Inicia: {formatFecha(est.fecha_inicio_membresia)}</span>
                          <span className="text-foreground/75 font-bold">Expira: {formatFecha(est.fecha_fin_membresia)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenActivar(est)}
                          className="!rounded-full !px-4 hover:border-primary/50 hover:text-primary"
                        >
                          Habilitar Acceso
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted">
            No se encontraron estudiantes que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Modal Habilitar / Configurar Acceso */}
      {isModalOpen && selectedEstudiante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card rounded-xl overflow-hidden shadow-2xl border border-card-border text-foreground">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-5 border-b border-card-border/60 bg-background/50 select-none">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Habilitar Membresía
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedEstudiante(null);
                }}
                className="p-1 rounded-full hover:bg-card-border/50 text-muted hover:text-primary transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarAcceso} className="p-6 flex flex-col gap-4">
              <div className="p-4 rounded-lg bg-background border border-card-border/60 flex flex-col gap-1 mb-2">
                <span className="text-xs text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Estudiante Seleccionado
                </span>
                <span className="text-sm font-black text-foreground">{selectedEstudiante.nombre} {selectedEstudiante.apellidos}</span>
                <span className="text-xs text-muted/80">{selectedEstudiante.correo} | DNI: {selectedEstudiante.dni}</span>
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Estado de Cuenta
                </label>
                <select
                  value={estadoCuenta}
                  onChange={(e) => setEstadoCuenta(e.target.value as any)}
                  disabled={isSubmitting}
                  className="flex h-11 w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                >
                  <option value="activo">Activo (Acceso Completo)</option>
                  <option value="trial">Prueba (Trial 1 Día)</option>
                  <option value="expirado">Expirado</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </div>

              {/* Fecha de Inicio */}
              <Input
                label="Fecha de Inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={isSubmitting}
              />

              {/* Fecha de Fin */}
              <Input
                label="Fecha de Expiración (Fin)"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={isSubmitting}
              />

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-4 border-t border-card-border/50 pt-4 select-none">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedEstudiante(null);
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
                  Guardar Acceso
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
