/**
 * Sri Lanka Macroeconomic Data Source & Benchmark Indices
 * All data points cite verified public sources (Central Bank of Sri Lanka - CBSL, Department of Census and Statistics - DCS).
 */

export interface MacroIndicator {
  key: string;
  name: string;
  value: string | number;
  unit: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  source: string;
  sourceUrl: string;
  asOfDate: string;
  description: string;
  educationalNote: string;
}

export interface MacroDashboardData {
  indicators: MacroIndicator[];
  riskFreeBenchmarkRateAnnual: number; // T-Bill 12M rate used for Sharpe calculation & Brutal Truth comparison
  cbslPolicyRate: number;
  lastUpdated: string;
}

export const CURRENT_MACRO_DATA: MacroDashboardData = {
  riskFreeBenchmarkRateAnnual: 9.85, // 12-Month Treasury Bill yield (%)
  cbslPolicyRate: 8.25, // CBSL Standing Deposit Facility Rate (SDFR)
  lastUpdated: "2026-10-01",
  indicators: [
    {
      key: "usd_lkr",
      name: "USD / LKR Exchange Rate",
      value: 298.50,
      unit: "LKR",
      change: "-0.25 LKR (Appreciated)",
      changeDirection: "down",
      source: "Central Bank of Sri Lanka (CBSL Daily Indicative Rate)",
      sourceUrl: "https://www.cbsl.gov.lk",
      asOfDate: "2026-10-01",
      description: "Exchange rate of Sri Lankan Rupee per US Dollar.",
      educationalNote: "A stable or strengthening Rupee lowers import inflation and stabilizes corporate margins for CSE companies reliant on raw material imports."
    },
    {
      key: "cbsl_sdfr",
      name: "CBSL Policy Rate (SDFR)",
      value: 8.25,
      unit: "%",
      change: "Held steady",
      changeDirection: "neutral",
      source: "CBSL Monetary Policy Board",
      sourceUrl: "https://www.cbsl.gov.lk",
      asOfDate: "2026-09-28",
      description: "Standing Deposit Facility Rate - the rate at which CBSL accepts deposits from commercial banks.",
      educationalNote: "Lower interest rates reduce the yield on fixed deposits and government securities, driving domestic capital into CSE equities searching for higher returns."
    },
    {
      key: "tbill_12m",
      name: "12-Month T-Bill Yield (Benchmark)",
      value: 9.85,
      unit: "%",
      change: "-15 bps",
      changeDirection: "down",
      source: "CBSL Primary Auction",
      sourceUrl: "https://www.cbsl.gov.lk",
      asOfDate: "2026-10-01",
      description: "Weighted average yield of 364-day Sri Lanka Treasury Bills (The Risk-Free Benchmark to beat).",
      educationalNote: "If your stock portfolio does not beat 9.85% net of fees and taxes, you took equity market risk for zero additional return compared to risk-free sovereign debt."
    },
    {
      key: "tbill_3m",
      name: "3-Month T-Bill Yield",
      value: 9.15,
      unit: "%",
      change: "-8 bps",
      changeDirection: "down",
      source: "CBSL Primary Auction",
      sourceUrl: "https://www.cbsl.gov.lk",
      asOfDate: "2026-10-01",
      description: "Short-term risk-free yield rate for 91-day Government Treasury bills.",
      educationalNote: "Short term yield curve indicator."
    },
    {
      key: "ccpi_inflation",
      name: "CCPI Headline Inflation (YoY)",
      value: 2.1,
      unit: "%",
      change: "+0.3%",
      changeDirection: "up",
      source: "Department of Census and Statistics (DCS Sri Lanka)",
      sourceUrl: "http://www.statistics.gov.lk",
      asOfDate: "2026-09-30",
      description: "Colombo Consumer Price Index year-on-year headline inflation rate.",
      educationalNote: "Low inflation preserves the purchasing power of company earnings and real investment returns."
    },
    {
      key: "aspi_pe",
      name: "CSE Market P/E Ratio",
      value: 9.4,
      unit: "x",
      change: "Undervalued vs regional peers",
      changeDirection: "neutral",
      source: "Colombo Stock Exchange Market Statistics",
      sourceUrl: "https://www.cse.lk",
      asOfDate: "2026-10-01",
      description: "Aggregate Price to Earnings ratio of the Colombo Stock Exchange.",
      educationalNote: "Historically, CSE trades between 9x and 14x P/E. A market P/E below 10x suggests attractive broad market valuation."
    },
    {
      key: "aspi_pbv",
      name: "CSE Market P/B Ratio",
      value: 1.15,
      unit: "x",
      change: "Near book value",
      changeDirection: "neutral",
      source: "Colombo Stock Exchange",
      sourceUrl: "https://www.cse.lk",
      asOfDate: "2026-10-01",
      description: "Aggregate Price to Book Value across all CSE listed equities.",
      educationalNote: "Indicates that companies on CSE trade close to the net replacement value of their assets."
    },
    {
      key: "aspi_div_yield",
      name: "CSE Market Dividend Yield",
      value: 4.8,
      unit: "%",
      change: "Consistent cash return",
      changeDirection: "neutral",
      source: "Colombo Stock Exchange",
      sourceUrl: "https://www.cse.lk",
      asOfDate: "2026-10-01",
      description: "Average annual cash dividend yield distributed by CSE listed companies.",
      educationalNote: "Provides a steady cash income stream on top of capital appreciation."
    }
  ]
};

export function getMacroData(): MacroDashboardData {
  return CURRENT_MACRO_DATA;
}
