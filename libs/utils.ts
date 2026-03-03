import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names with conflict resolution.
 * Uses clsx for conditionals and twMerge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
/**
 * Formats timestamp for inside chat messages.
 *
 * Rules:
 * - Today        → "2:34 PM"
 * - Same year    → "Feb 15, 2:34 PM"
 * - Different yr → "Feb 15, 2023, 2:34 PM"
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // If sent today → show only time
  if (isToday) return time;

  // If within same year → show date + time
  if (isThisYear) {
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return `${dateStr}, ${time}`;
  }

  // Older year → include year + time
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${dateStr}, ${time}`;
}





/**
 * Formats timestamp for sidebar / conversation preview.
 *
 * Rules:
 * - Today        → "2:34 PM"
 * - Same year    → "Feb 15"
 * - Different yr → "Feb 15, 2023"
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  // If message was sent today → show only time
  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // If within current year → show short date
  if (isThisYear) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Older than current year → include year
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
