import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-black hover:brightness-110",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border-2 border-slate-200 dark:border-neutral-700 bg-transparent text-foreground hover:bg-slate-50 dark:hover:bg-neutral-800",
        secondary:
          "bg-secondary text-white hover:brightness-110",
        ghost:
          "text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        agree:
          "bg-agree/10 text-agree hover:bg-agree/15 border border-agree/20",
        disagree:
          "bg-disagree/10 text-disagree hover:bg-disagree/15 border border-disagree/20",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8 text-base",
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
