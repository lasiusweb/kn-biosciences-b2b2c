"use client";

import React from "react";

interface AlertProps {
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

export function Alert({ variant = "default", children }: AlertProps) {
  const baseClasses = "p-4 rounded-lg border";
  const variantClasses = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="mb-1 font-medium leading-none tracking-tight">{children}</h5>;
}
