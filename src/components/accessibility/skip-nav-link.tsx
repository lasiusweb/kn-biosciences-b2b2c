// components/accessibility/skip-nav-link.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipNavLinkProps {
  targetId: string;
  children?: React.ReactNode;
  className?: string;
}

export const SkipNavLink = React.forwardRef<
  HTMLAnchorElement,
  SkipNavLinkProps
>(({ targetId, children = "Skip to main content", className, ...props }, ref) => {
  return (
    <a
      ref={ref}
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-organic-500",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
});

SkipNavLink.displayName = "SkipNavLink";