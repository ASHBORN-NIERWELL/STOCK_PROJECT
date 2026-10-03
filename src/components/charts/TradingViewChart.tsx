"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { OHLCVBar } from "@/db/seed-data";
import { formatLKR, formatVolume } from "@/lib/utils";

interface TradingViewChartProps {
  data: OHLCVBar[];
  height?: number;
  symbol?: string;
  onAnnotation?: (price: number) => void;
  annotationZone?: [number, number];
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  height = 420,
  symbol = "CSE Equities",
  onAnnotation,
  annotationZone,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [activeBar, setActiveBar] = useState<OHLCVBar | null>(data[data.length - 1] || null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Clean up previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#090d16" },
        textColor: "#94a3b8",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.5)" },
        horzLines: { color: "rgba(30, 41, 59, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      crosshair: {
        mode: 1,
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#1e293b",
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "#38bdf8",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Format candle data for lightweight charts
    const candleData = data.map((d) => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData = data.map((d) => ({
      time: d.time as any,
      value: d.volume,
      color: d.close >= d.open ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
    }));

    candlestickSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    // Crosshair move listener
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData.get(candlestickSeries)) {
        const bar = param.seriesData.get(candlestickSeries) as any;
        if (bar) {
          const matched = data.find((d) => d.time === param.time);
          if (matched) setActiveBar(matched);
        }
      }
    });

    // Click listener for annotation lab
    if (onAnnotation) {
      chart.subscribeClick((param) => {
        if (param.point && param.seriesData.get(candlestickSeries)) {
          const bar = param.seriesData.get(candlestickSeries) as any;
          if (bar) {
            onAnnotation(bar.close);
          }
        }
      });
    }

    chart.timeScale().fitContent();

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candlestickSeries;

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [data, height]);

  const currentBar = activeBar || data[data.length - 1];

  return (
    <div className="flex flex-col w-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
      {/* Chart Header Ticker Stats */}
      {currentBar && (
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-100">{symbol}</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-slate-400">
                O: <span className="text-slate-200">{currentBar.open.toFixed(2)}</span>
              </span>
              <span className="text-slate-400">
                H: <span className="text-emerald-400">{currentBar.high.toFixed(2)}</span>
              </span>
              <span className="text-slate-400">
                L: <span className="text-rose-400">{currentBar.low.toFixed(2)}</span>
              </span>
              <span className="text-slate-400">
                C:{" "}
                <span className={currentBar.close >= currentBar.open ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {currentBar.close.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Vol: {formatVolume(currentBar.volume)}</span>
            <span>Date: {currentBar.time}</span>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full" style={{ height }} />
    </div>
  );
};
