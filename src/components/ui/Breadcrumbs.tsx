"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// Mapeo simple de nombres amigables para rutas estáticas
const routeNames: Record<string, string> = {
  dashboard: "Panel de control",
  admin: "Administración",
  cursos: "Cursos",
  estudiantes: "Estudiantes",
  curso: "Cursos",
  tema: "Temas",
};

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login") return null;

  const segments = pathname.split("/").filter(Boolean);

  const cleanLabel = (segment: string) => {
    // Si el segmento es un ID o slug conocido, lo formateamos limpiamente
    if (routeNames[segment]) {
      return routeNames[segment];
    }
    // Reemplazar guiones por espacios y capitalizar palabras
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted select-none py-4 border-b border-card-border/40 mb-6">
      <Link
        href="/"
        className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Kchimbo+</span>
      </Link>

      {segments.map((segment, idx) => {
        const url = `/${segments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === segments.length - 1;
        const label = cleanLabel(segment);

        // Si es el segmento "curso" o "tema" y no es el último, es solo un agrupador visual
        const isPlaceholder = segment === "curso" || segment === "tema";

        return (
          <React.Fragment key={url}>
            <ChevronRight className="h-3.5 w-3.5 text-muted/50 flex-shrink-0" />
            {isLast || isPlaceholder ? (
              <span className={isLast ? "text-foreground font-bold" : "text-muted"}>
                {label}
              </span>
            ) : (
              <Link
                href={url}
                className="text-muted hover:text-primary transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
