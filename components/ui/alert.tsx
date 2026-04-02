import { cn } from "@/lib/utils";

type AlertProps = {
  variant?: "info" | "error" | "success";
  message: string;
};

export function Alert({ variant = "info", message }: AlertProps) {
  const palette = {
    info: "border-ocean-200 bg-ocean-50 text-ocean-800",
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return <div className={cn("rounded-2xl border px-4 py-3 text-sm font-semibold", palette[variant])}>{message}</div>;
}
