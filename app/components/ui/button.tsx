import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[2px] text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-black hover:brightness-110",
        destructive:
          "bg-negative text-white hover:bg-negative/90",
        outline:
          "border border-white bg-transparent text-white hover:bg-white/10",
        secondary:
          "bg-secondary text-white hover:bg-secondary/90",
        ghost:
          "text-muted hover:bg-white/5 hover:text-white",
        link: "text-foreground underline-offset-4 hover:underline",
        agree:
          "bg-positive/10 text-positive hover:bg-positive/15 border border-positive/30 font-mono",
        disagree:
          "bg-negative/10 text-negative hover:bg-negative/15 border border-negative/30 font-mono",
        pending:
          "bg-muted/10 text-muted hover:bg-muted/15 border border-muted/30 font-mono",
      },
      size: {
        default: "h-9 px-5 py-2 text-xs",
        sm: "h-8 px-4 text-[10px]",
        lg: "h-11 px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
