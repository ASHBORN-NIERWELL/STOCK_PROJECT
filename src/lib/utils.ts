import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLKR(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) return "LKR 0.00";
  return `LKR ${Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) return "0.00";
  return Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(value: number | undefined | null, includeSign = true): string {
  if (value === undefined || value === null || isNaN(value)) return "0.00%";
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(2)}%`;
}

export function formatVolume(val: number): string {
  if (!val || isNaN(val)) return "0";
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "k";
  return val.toLocaleString();
}

export function formatColomboDate(dateOrTimestamp: Date | number | string): string {
  try {
    const d = new Date(dateOrTimestamp);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(d);
  } catch (e) {
    return String(dateOrTimestamp);
  }
}

export function formatColomboDateShort(dateOrTimestamp: Date | number | string): string {
  try {
    const d = new Date(dateOrTimestamp);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (e) {
    return String(dateOrTimestamp);
  }
}

export function isMarketOpenNow(): boolean {
  try {
    const now = new Date();
    // Format to Asia/Colombo time
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value;
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

    if (weekday === "Sat" || weekday === "Sun") return false;
    const currentMinutes = hour * 60 + minute;
    // CSE Regular trading: 09:30 to 14:30 SLST (570 to 870 minutes)
    return currentMinutes >= 570 && currentMinutes <= 870;
  } catch (e) {
    return false;
  }
}
