import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-brand-500 text-white hover:bg-brand-600",
    secondary: "bg-ocean-500 text-white hover:bg-ocean-600",
    ghost: "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  };

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
