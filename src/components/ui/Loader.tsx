"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = "md", fullScreen = false }) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    : "flex flex-col items-center justify-center p-6 w-full h-full min-h-[200px]";

  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-20 w-20 border-4",
  };

  const spinnerSize = sizes[size];

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer pulsating glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute rounded-full bg-primary/20 filter blur-xl ${
            size === "lg" ? "h-28 w-28" : size === "md" ? "h-16 w-16" : "h-8 w-8"
          }`}
        />

        {/* Rotating border spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`rounded-full border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/30 ${spinnerSize}`}
        />

        {/* Center brand dot */}
        <div
          className={`absolute rounded-full bg-primary ${
            size === "lg" ? "h-5 w-5" : size === "md" ? "h-3 w-3" : "h-1.5 w-1.5"
          }`}
        />
      </div>

      {size !== "sm" && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-4 font-display font-semibold tracking-wider text-primary ${
            size === "lg" ? "text-lg" : "text-sm"
          }`}
        >
          KCHIMBO<span className="text-foreground">+</span>
        </motion.p>
      )}
    </div>
  );
};
