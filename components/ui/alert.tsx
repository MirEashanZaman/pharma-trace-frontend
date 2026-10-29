import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-3 text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3",
  {
    variants: {
      variant: {
        default: "bg-[#172638] border-[#304257] text-[#F1F5F9] [&>svg]:text-[#00D6B4]",
        destructive:
          "border-none bg-[#F87171] text-[#0B1220] font-bold [&>svg]:text-[#0B1220]",
        success:
          "border-[#A3E635]/40 bg-[#A3E635]/20 text-[#A3E635] [&>svg]:text-[#A3E635]",
        warning:
          "border-[#FBBF24]/40 bg-[#FBBF24]/20 text-[#FBBF24] [&>svg]:text-[#FBBF24]",
        teal:
          "border-[#00D6B4]/40 bg-[#00D6B4]/15 text-[#00D6B4] [&>svg]:text-[#00D6B4]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

