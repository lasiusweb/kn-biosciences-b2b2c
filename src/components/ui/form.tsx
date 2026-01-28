import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const formVariants = cva("space-y-4", {
  variants: {
    spacing: {
      sm: "space-y-2",
      md: "space-y-4",
      lg: "space-y-6",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
});

export interface FormProps
  extends
    React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {
  spacing?: "sm" | "md" | "lg";
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, spacing, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(formVariants({ spacing, className }))}
        {...props}
      >
        {children}
      </form>
    );
  },
);
Form.displayName = "Form";

export { Form, formVariants };
