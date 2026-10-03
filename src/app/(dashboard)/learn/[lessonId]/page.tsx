import React from "react";
import { notFound } from "next/navigation";
import { getLessonById } from "@/lib/learning/curriculum";
import { cseProvider } from "@/lib/cse/provider";
import { getCurrentUser } from "@/lib/auth/session";
import { memoryStore } from "@/db/memory-store";
import { LabPlayerClient } from "./LabPlayerClient";

export const dynamic = "force-dynamic";

export default async function LessonLabPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lesson = getLessonById(params.lessonId);
  if (!lesson) {
    notFound();
  }

  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-1";
  const progress = memoryStore.getProgress(userId, lesson.id);

  // Fetch relevant stock history for the lab
  const symbol = lesson.hook.symbol || "COMB.N0000";
  const history = await cseProvider.getStockHistory(symbol, "6M");

  return (
    <LabPlayerClient
      lesson={lesson}
      history={history}
      symbol={symbol}
      existingProgress={progress}
      userId={userId}
    />
  );
}
