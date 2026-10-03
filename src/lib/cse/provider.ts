import { cseLiveClient, MarketSummaryData, FreshnessType } from "./cse-live-client";
import { CSE_COMPANIES, StockQuote, OHLCVBar, generateRealisticStockBars, ASPI_HISTORICAL_DATA, SPSL20_HISTORICAL_DATA, HISTORICAL_ANNOUNCEMENTS, CorporateAnnouncement } from "@/db/seed-data";
import { memoryStore } from "@/db/memory-store";

export interface ICSEDataProvider {
  getMarketSummary(forceRefresh?: boolean): Promise<MarketSummaryData>;
  getStockQuote(symbol: string): Promise<StockQuote | null>;
  getStockHistory(symbol: string, timeframe?: "1D" | "1W" | "1M" | "6M" | "1Y" | "ALL"): Promise<OHLCVBar[]>;
  getAnnouncements(symbol?: string): Promise<CorporateAnnouncement[]>;
  getAllQuotes(): Promise<StockQuote[]>;
}

export class UnifiedCSEDataProvider implements ICSEDataProvider {
  private mode: "CSE_LIVE" | "DEMO" | "CSV_IMPORT";

  constructor() {
    this.mode = (process.env.CSE_PROVIDER as any) || "CSE_LIVE";
  }

  public setMode(mode: "CSE_LIVE" | "DEMO" | "CSV_IMPORT") {
    this.mode = mode;
  }

  public async getMarketSummary(forceRefresh = false): Promise<MarketSummaryData> {
    if (this.mode === "DEMO") {
      return cseLiveClient.getFallbackDemoMarketData("DEMO (Configured)");
    }
    return cseLiveClient.getMarketSummary(forceRefresh);
  }

  public async getStockQuote(symbol: string): Promise<StockQuote | null> {
    const summary = await this.getMarketSummary();
    const cleanSym = symbol.toUpperCase().trim();
    const found = summary.quotes.find((q) => q.symbol.toUpperCase() === cleanSym || q.symbol.split(".")[0].toUpperCase() === cleanSym);
    if (found) return found;

    const seed = CSE_COMPANIES.find((c) => c.symbol.toUpperCase() === cleanSym || c.symbol.split(".")[0].toUpperCase() === cleanSym);
    return seed || null;
  }

  public async getAllQuotes(): Promise<StockQuote[]> {
    const summary = await this.getMarketSummary();
    return summary.quotes;
  }

  public async getStockHistory(symbol: string, timeframe: "1D" | "1W" | "1M" | "6M" | "1Y" | "ALL" = "6M"): Promise<OHLCVBar[]> {
    const cleanSym = symbol.toUpperCase().trim();
    if (cleanSym === "ASPI") return ASPI_HISTORICAL_DATA;
    if (cleanSym === "SPSL20" || cleanSym === "S&P SL20") return SPSL20_HISTORICAL_DATA;

    const quote = await this.getStockQuote(symbol);
    const basePrice = quote ? quote.price : 100;
    const days = timeframe === "1W" ? 14 : timeframe === "1M" ? 30 : timeframe === "6M" ? 120 : timeframe === "1Y" ? 250 : 365;

    // Cache key for generated or stored historical bars
    const cacheKey = `history_${cleanSym}_${days}`;
    const cached = memoryStore.getCache(cacheKey);
    if (cached) return cached;

    const trend = quote ? (quote.percentageChange > 0 ? "bullish" : "ranging") : "bullish";
    const seed = Math.abs(cleanSym.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 100);
    const bars = generateRealisticStockBars(cleanSym, basePrice, days, trend, seed);

    memoryStore.setCache(cacheKey, bars, 3600, "REPLAY_GENERATOR");
    return bars;
  }

  public async getAnnouncements(symbol?: string): Promise<CorporateAnnouncement[]> {
    if (!symbol) return HISTORICAL_ANNOUNCEMENTS;
    const cleanSym = symbol.toUpperCase().trim();
    return HISTORICAL_ANNOUNCEMENTS.filter(
      (a) => a.symbol.toUpperCase() === cleanSym || a.symbol.split(".")[0].toUpperCase() === cleanSym
    );
  }
}

export const cseProvider = new UnifiedCSEDataProvider();
