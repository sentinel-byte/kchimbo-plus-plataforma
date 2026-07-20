"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  GraduationCap,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function CursoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<{ nombre: string; correo: string; rol: string; plan: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("No autenticado");
        }
        const data = await res.json();
        setUsuario(data.usuario);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  if (loading) {
    return <Loader size="lg" fullScreen />;
  }

  const menuItems = [
    {
      name: "Inicio",
      path: "/dashboard",
      icon: <Home className="h-4.5 w-4.5" />,
    },
    {
      name: "Temario",
      path: "/dashboard/temario",
      icon: <ClipboardList className="h-4.5 w-4.5" />,
    },
    {
      name: "Cursos",
      path: "/dashboard/cursos",
      icon: <GraduationCap className="h-4.5 w-4.5" />,
    },
    {
      name: "Membresía y Pagos",
      path: "/dashboard/pagos",
      icon: <CreditCard className="h-4.5 w-4.5" />,
    },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-card-border shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-card-border/55">
          <Link href="/" className="font-display text-xl font-black tracking-tight text-primary">
            KCHIMBO<span>+</span>
          </Link>
        </div>

        <div className="p-4 border-b border-card-border/50 flex flex-col gap-1 bg-primary/5 m-4 rounded-lg">
          <span className="text-xs font-semibold text-primary-dark uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Plan {usuario?.plan}
          </span>
          <span className="text-sm font-bold truncate text-foreground/90">{usuario?.nombre}</span>
          <span className="text-[11px] text-muted truncate">{usuario?.correo}</span>
        </div>

        <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 h-11 rounded-md text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-foreground/80 hover:bg-card-border/30 hover:text-primary"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-card-border/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 h-11 w-full rounded-md text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all focus:outline-none"
          >
            <LogOut className="h-4.5 w-4.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-card border-b border-card-border/55 z-30">
          <Link href="/" className="font-display text-xl font-black tracking-tight text-primary">
            KCHIMBO<span>+</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-foreground/80 hover:text-primary transition-colors focus:outline-none"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            
            <aside className="relative flex flex-col w-64 max-w-xs bg-card h-full z-50 border-r border-card-border shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="h-16 flex items-center justify-between px-6 border-b border-card-border/50">
                <span className="font-display text-xl font-black tracking-tight text-primary">
                  KCHIMBO<span>+</span>
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-card-border/50 text-foreground/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 border-b border-card-border/50 flex flex-col gap-1 bg-primary/5 m-4 rounded-lg">
                <span className="text-xs font-semibold text-primary-dark uppercase tracking-wider">
                  Plan {usuario?.plan}
                </span>
                <span className="text-sm font-bold truncate text-foreground/90">{usuario?.nombre}</span>
                <span className="text-[11px] text-muted truncate">{usuario?.correo}</span>
              </div>

              <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 h-11 rounded-md text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-foreground/80 hover:bg-card-border/30 hover:text-primary"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-card-border/50">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 h-11 w-full rounded-md text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all focus:outline-none"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Cerrar sesión
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
