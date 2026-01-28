import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-organic-200 border-t-organic-600",
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="sr-only">Loading...</div>
    </div>
  );
}
