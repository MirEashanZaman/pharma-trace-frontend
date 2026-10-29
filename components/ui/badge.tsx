import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[#00D6B4]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#00D6B4] text-[#0B1220] font-bold",
        secondary:
          "border-[#304257] bg-[#172638] text-[#94A3B8]",
        destructive:
          "border-transparent bg-[#F87171] text-[#0B1220] font-bold",
        outline:
          "border-[#304257] text-[#F1F5F9]",
        teal:
          "border-[#00D6B4]/40 bg-[#00D6B4]/15 text-[#00D6B4] font-mono",
        success:
          "border-[#A3E635]/40 bg-[#A3E635]/20 text-[#A3E635]",
        warning:
          "border-[#FBBF24]/40 bg-[#FBBF24]/20 text-[#FBBF24]",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5",
        xs: "text-[9px] px-1.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

