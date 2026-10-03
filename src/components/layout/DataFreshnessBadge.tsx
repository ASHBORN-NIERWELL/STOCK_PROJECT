import React from "react";
import { FreshnessType } from "@/lib/cse/cse-live-client";

interface DataFreshnessBadgeProps {
  freshness: FreshnessType;
  timestamp?: string;
  source?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  freshness,
  timestamp,
  source,
}) => {
  const badgeConfig = {
    LIVE: {
      label: "LIVE (CSE)",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400 animate-pulse",
    },
    DELAYED: {
      label: "DELAYED",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      dot: "bg-amber-400",
    },
    CACHED: {
      label: "CACHED (1m)",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      dot: "bg-blue-400",
    },
    DEMO: {
      label: "DEMO DATA",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      dot: "bg-purple-400",
    },
  };

  const current = badgeConfig[freshness] || badgeConfig.DEMO;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.color}`}
      title={source ? `Data Source: ${source}` : undefined}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </div>
  );
};
