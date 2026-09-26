import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" };
const variants = {
  default: "bg-[var(--ink)] text-[var(--accent-contrast)] hover:opacity-85",
  outline: "border border-[var(--line)] hover:border-[var(--ink)]",
  ghost: "hover:bg-[var(--surface-hover)]",
};
export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return <button className={cn("inline-flex min-h-10 items-center justify-center rounded-sm px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50", variants[variant], className)} {...props} />;
}

