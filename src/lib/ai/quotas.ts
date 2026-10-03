import { memoryStore } from "@/db/memory-store";

export interface QuotaStatus {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  isQuotaExceeded: boolean;
  provider: string;
}

const userDailyCallCount = new Map<string, { count: number; dateStr: string }>();

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function checkUserQuota(userId: string, maxDaily = 50): QuotaStatus {
  const today = getTodayDateString();
  const current = userDailyCallCount.get(userId);

  if (!current || current.dateStr !== today) {
    userDailyCallCount.set(userId, { count: 0, dateStr: today });
    return {
      dailyLimit: maxDaily,
      usedToday: 0,
      remainingToday: maxDaily,
      isQuotaExceeded: false,
      provider: process.env.AI_PROVIDER || "gemini",
    };
  }

  const isExceeded = current.count >= maxDaily;
  return {
    dailyLimit: maxDaily,
    usedToday: current.count,
    remainingToday: Math.max(0, maxDaily - current.count),
    isQuotaExceeded: isExceeded,
    provider: process.env.AI_PROVIDER || "gemini",
  };
}

export function incrementUserQuota(userId: string): void {
  const today = getTodayDateString();
  const current = userDailyCallCount.get(userId);
  if (!current || current.dateStr !== today) {
    userDailyCallCount.set(userId, { count: 1, dateStr: today });
  } else {
    current.count += 1;
    userDailyCallCount.set(userId, current);
  }
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash)}`;
}
