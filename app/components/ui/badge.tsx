import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[2px] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/5 text-foreground border border-[#1A1A1A]",
        secondary: "bg-muted/10 text-muted border border-[#1A1A1A]",
        destructive: "bg-negative/10 text-negative border border-negative/30",
        outline: "border border-[#1A1A1A] text-muted",
        agree: "bg-positive/10 text-positive border border-positive/30",
        disagree: "bg-negative/10 text-negative border border-negative/30",
        pending: "bg-muted/10 text-muted border border-muted/30",
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
