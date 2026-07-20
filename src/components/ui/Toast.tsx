"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = timeoutRefs.current?.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, type, title, message, duration };
      
      setToasts((prev) => [...prev, newToast]);

      const timeout = setTimeout(() => {
        removeToast(id);
        timeoutRefs.current.delete(id);
      }, duration);
      timeoutRefs.current.set(id, timeout);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      
      {/* Contenedor de Toasts Flotantes */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none select-none">
        {toasts.map((toast) => {
          let icon = <Info className="h-5 w-5 text-blue-500" />;
          let borderClass = "border-blue-500/20";
          let bgClass = "bg-card/85";
          
          if (toast.type === "success") {
            icon = <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-300" />;
            borderClass = "border-green-500/25";
          } else if (toast.type === "error") {
            icon = <AlertCircle className="h-5 w-5 text-red-500 animate-bounce" />;
            borderClass = "border-red-500/25";
          }

          return (
            <div
              key={toast.id}
              className={`p-4 rounded-xl border ${borderClass} ${bgClass} backdrop-blur-md shadow-premium pointer-events-auto flex gap-3.5 items-start justify-between animate-in slide-in-from-right-8 fade-in-20 duration-300`}
              role="alert"
            >
              <div className="flex gap-3 min-w-0">
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  {toast.title && (
                    <span className="font-display font-black text-sm text-foreground leading-tight">
                      {toast.title}
                    </span>
                  )}
                  <span className="text-xs text-muted font-semibold leading-relaxed">
                    {toast.message}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full hover:bg-card-border/60 text-muted hover:text-foreground transition-all focus:outline-none flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser utilizado dentro de un ToastProvider");
  }
  return context;
}
