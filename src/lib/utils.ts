import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(weight: number | null | undefined): string {
  if (weight === null || weight === undefined || isNaN(weight)) {
    return "--.--";
  }
  return weight.toFixed(2);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "--:--";
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "--/--/----";
  const d = new Date(date);
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}
