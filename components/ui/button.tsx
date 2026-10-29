"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00D6B4] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#00D6B4] text-[#0B1220] hover:bg-[#00b89a] shadow-sm",
        destructive:
          "bg-[#F87171] text-[#0B1220] hover:bg-[#F87171]/90 shadow-sm",
        outline:
          "border border-[#304257] bg-transparent text-[#F1F5F9] hover:bg-[#172638] hover:border-[#00D6B4]",
        secondary:
          "bg-[#172638] text-[#00D6B4] border border-[#304257] hover:bg-[#243247]",
        ghost:
          "text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]",
        link:
          "text-[#00D6B4] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-xl px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-sm",
        icon: "h-8 w-8 rounded-lg",
        xs: "h-7 rounded-lg px-2 text-[10px]",
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
