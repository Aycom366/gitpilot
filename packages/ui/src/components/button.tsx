import * as React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
}

export function buttonVariants({
  variant = "default",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-violet-600 text-white hover:bg-violet-700": variant === "default",
      "border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white":
        variant === "outline",
      "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white":
        variant === "ghost",
      "bg-transparent text-violet-400 underline-offset-4 hover:underline":
        variant === "link",
    },
    {
      "h-8 px-3 text-sm": size === "sm",
      "h-10 px-5 text-sm": size === "md",
      "h-12 px-8 text-base": size === "lg",
    },
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);

Button.displayName = "Button";
