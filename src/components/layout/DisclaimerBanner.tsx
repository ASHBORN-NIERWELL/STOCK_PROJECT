"use client";

import React, { useState } from "react";
import { AlertCircle, X, ShieldCheck } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-300">Educational Simulation Notice:</strong> CSE Mastery is strictly for educational and training purposes. All trading occurs with virtual LKR capital. This is not financial or investment advice.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/80 hover:text-amber-200 ml-4 p-1 rounded-md hover:bg-amber-900/30"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
