"use client";

import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, icon, type = "text", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col w-full gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-muted select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={`flex h-11 w-full rounded-md border border-card-border bg-card ${icon ? "pl-10" : "px-3.5"} py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
              error
                ? "border-red-500 focus-visible:ring-red-500"
                : "hover:border-primary/50 focus-visible:border-primary"
            } ${icon ? "pr-3.5" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted/80">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
