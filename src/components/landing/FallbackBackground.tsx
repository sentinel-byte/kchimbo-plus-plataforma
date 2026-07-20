"use client";

import React from "react";

export const FallbackBackground: React.FC = () => {
  // Generar posiciones estáticas pseudo-aleatorias consistentes para 30 partículas
  const particulas = Array.from({ length: 30 }).map((_, i) => {
    const size = (i % 3) * 1.5 + 2; // 2px, 3.5px, 5px (puntitos muy pequeños y finos)
    const left = ((i * 17) % 100);
    const top = ((i * 23) % 100);
    const delay = (i % 5) * -2; // Delays negativos para que la animación empiece ya activa
    const duration = 12 + (i % 4) * 3; // 12s, 15s, 18s, 21s
    const drift = (i % 2 === 0 ? 25 : -25); // Desplazamiento lateral

    return { size, left, top, delay, duration, drift };
  });

  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden transition-colors duration-300">
      {/* 
        OPTIMIZACIÓN BRUTAL:
        Usamos gradientes radiales puros en CSS en lugar de filtros de desenfoque (blur-[100px]) sobre elementos transformados.
        Los gradientes radiales se calculan una sola vez y no ralentizan el motor de renderizado al hacer scroll.
      */}
      {/* Gradiente superior naranja */}
      <div 
        className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full pointer-events-none opacity-40 dark:opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(220,76,0,0.12) 0%, rgba(220,76,0,0) 70%)"
        }}
      />

      {/* Gradiente inferior café/secundario */}
      <div 
        className="absolute bottom-[-20%] left-[-15%] w-[65vw] h-[65vw] rounded-full pointer-events-none opacity-45 dark:opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(74,52,40,0.1) 0%, rgba(74,52,40,0) 70%)"
        }}
      />

      {/* Gradiente central suave */}
      <div 
        className="absolute top-[20%] left-[20%] lg:left-[55%] w-[60vw] h-[60vw] rounded-full pointer-events-none opacity-30 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(220,76,0,0.06) 0%, rgba(220,76,0,0) 70%)"
        }}
      />

      {/* Capa de partículas flotantes animadas con CSS PURO (Cero JS, Cero re-renders, Aceleración por GPU) */}
      <div className="absolute inset-0 opacity-55 pointer-events-none">
        {particulas.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/45"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationName: "floatNativo",
              animationDuration: `${p.duration}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${p.delay}s`,
              transform: "translate3d(0, 0, 0)", // Forzar renderizado por GPU (layer 3D)
              // Definir la variable CSS del drift para el desplazamiento lateral en la animación
              // y usar interpolación simple
              opacity: 0.35,
            }}
          />
        ))}
      </div>

      {/* Estilos CSS nativos inyectados para evitar procesamiento de JS de animaciones */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatNativo {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0.25;
          }
          50% {
            transform: translate3d(15px, -60px, 0);
            opacity: 0.7;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.25;
          }
        }
      `}} />
    </div>
  );
};
