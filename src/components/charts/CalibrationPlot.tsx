"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CalibrationItem } from "@/lib/learning/adaptive-engine";

interface CalibrationPlotProps {
  data: CalibrationItem[];
  height?: number;
}

export const CalibrationPlot: React.FC<CalibrationPlotProps> = ({
  data,
  height = 260,
}) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis dataKey="confidenceBucket" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.5rem",
              color: "#f8fafc",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
          <Bar dataKey="expectedAccuracyPercent" name="Subjective Confidence %" fill="#64748b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actualAccuracyPercent" name="Actual Accuracy %" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
