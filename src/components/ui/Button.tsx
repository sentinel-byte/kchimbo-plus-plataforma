"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md",
      secondary:
        "bg-secondary text-white hover:opacity-90 shadow-sm",
      outline:
        "border border-card-border bg-transparent hover:bg-card-border/30 text-foreground",
      ghost:
        "bg-transparent hover:bg-card-border/20 text-foreground",
      link:
        "text-primary-dark underline-offset-4 hover:underline bg-transparent !p-0 !h-auto",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-11 px-6 text-sm gap-2",
      lg: "h-14 px-8 text-base gap-2.5 rounded-lg",
    };

    const currentVariantClass = variants[variant];
    const currentSizeClass = sizes[size];

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading || variant === "link" ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading || variant === "link" ? 1 : 0.98 }}
        className={`${baseStyles} ${currentVariantClass} ${currentSizeClass} ${className}`}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
