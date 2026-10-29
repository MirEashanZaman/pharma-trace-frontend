import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-[#304257] bg-[#172638] px-3 py-1 text-xs text-[#F1F5F9] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#00D6B4] disabled:cursor-not-allowed disabled:opacity-50 font-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

