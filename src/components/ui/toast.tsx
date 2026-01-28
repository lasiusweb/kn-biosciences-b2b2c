import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success: "border-green-200 bg-green-50 text-green-800",
        error: "border-red-200 bg-red-50 text-red-800",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ToastProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    { className, variant, title, description, onClose, children, ...props },
    ref,
  ) => {
    const getIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle className="h-5 w-5" />;
        case "error":
          return <AlertCircle className="h-5 w-5" />;
        case "warning":
          return <AlertCircle className="h-5 w-5" />;
        case "info":
          return <Info className="h-5 w-5" />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant, className }))}
        {...props}
      >
        <div className="grid gap-1">
          {title && (
            <div className="flex items-center gap-2">
              {getIcon()}
              <div className="text-sm font-semibold">{title}</div>
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);
Toast.displayName = "Toast";

export { Toast, toastVariants };
