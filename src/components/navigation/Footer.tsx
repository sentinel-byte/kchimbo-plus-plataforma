"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-card-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-display text-2xl font-black tracking-tight text-primary">
            KCHIMBO<span>+</span>
          </Link>
          <p className="text-sm text-muted max-w-xs leading-relaxed font-medium">
            Plataforma educativa premium dedicada a la preparación preuniversitaria y universitaria para Medicina Humana, Ingeniería Civil y otras especialidades.
          </p>
        </div>

        {/* Links: Platform */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Plataforma</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-sm text-muted hover:text-primary transition-colors">
                Aula Virtual
              </Link>
            </li>
          </ul>
        </div>

        {/* Links: Legal */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Legal</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <span className="text-sm text-muted cursor-not-allowed">
                Términos de servicio
              </span>
            </li>
            <li>
              <span className="text-sm text-muted cursor-not-allowed">
                Política de privacidad
              </span>
            </li>
          </ul>
        </div>

        {/* Brand Accent / Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Identidad</h4>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex flex-col gap-2">
            <span className="text-xs font-semibold text-primary-dark">Orgullo Académico</span>
            <p className="text-xs text-muted leading-relaxed font-medium">
              Inspirado en el término tradicional del estudiante nuevo, potenciado para el éxito en la medicina humana.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-card-border/55 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <p>&copy; {new Date().getFullYear()} Kchimbo+. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <span>Diseño Premium</span>
          <span>&bull;</span>
          <span>Desarrollado con Next.js & Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
};
