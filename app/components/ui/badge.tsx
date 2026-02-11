import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-foreground/5 text-foreground",
        secondary: "bg-muted text-muted-foreground",
        destructive: "bg-disagree/10 text-disagree",
        outline: "border text-muted-foreground",
        agree: "bg-agree/10 text-agree",
        disagree: "bg-disagree/10 text-disagree",
        pending: "bg-pending/10 text-pending",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
