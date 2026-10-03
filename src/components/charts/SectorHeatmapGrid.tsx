import React from "react";
import { formatVolume, formatPercentage } from "@/lib/utils";

interface SectorItem {
  sector: string;
  sectorCode: string;
  percentageChange: number;
  turnover: number;
  advances: number;
  declines: number;
  count: number;
}

interface SectorHeatmapGridProps {
  sectors: SectorItem[];
  onSelectSector?: (sector: SectorItem) => void;
}

export const SectorHeatmapGrid: React.FC<SectorHeatmapGridProps> = ({
  sectors,
  onSelectSector,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
      {sectors.map((s) => {
        const isUp = s.percentageChange > 0;
        const isFlat = s.percentageChange === 0;

        const bgClass = isFlat
          ? "bg-slate-900/80 border-slate-800"
          : isUp
          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
          : "bg-rose-950/40 border-rose-500/30 text-rose-300";

        return (
          <div
            key={s.sectorCode}
            onClick={() => onSelectSector?.(s)}
            className={`p-3 rounded-lg border transition-all cursor-pointer hover:scale-102 flex flex-col justify-between ${bgClass}`}
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>{s.sectorCode}</span>
                <span>{s.count} cos</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 mt-1 truncate" title={s.sector}>
                {s.sector}
              </h4>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <span className={`text-xs font-bold font-mono ${isUp ? "text-emerald-400" : isFlat ? "text-slate-300" : "text-rose-400"}`}>
                {formatPercentage(s.percentageChange)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatVolume(s.turnover)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
