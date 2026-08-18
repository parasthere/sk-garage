import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "COMPLETED":
    case "PAID":
    case "IN_STOCK":
    case "CONFIRMED":
    case "AVAILABLE":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";

    case "IN_PROGRESS":
    case "PARTIAL":
    case "INSPECTION":
    case "BUSY":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/30";

    case "SCHEDULED":
    case "PENDING":
    case "APPROVED":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/30";

    case "WAITING_PARTS":
    case "LOW_STOCK":
    case "ON_LEAVE":
      return "bg-orange-500/10 text-orange-400 border border-orange-500/30";

    case "CANCELLED":
    case "REFUNDED":
    case "OUT_OF_STOCK":
    case "ERROR":
      return "bg-red-500/10 text-red-400 border border-red-500/30";

    default:
      return "bg-surface-container-high text-on-surface-variant border border-outline-variant";
  }
}
