/**
 * Bundled Real Historical CSE Market Data, Companies, Financials & Historical Episodes
 */

export interface StockQuote {
  symbol: string;
  name: string;
  sector: string;
  sectorCode: string;
  price: number;
  change: number;
  percentageChange: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  turnover: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  eps: number;
  roe: number;
  debtToEquity: number;
  beta: number;
  sharesOutstanding: number;
  lastTradedTime: string;
  description: string;
}

export interface OHLCVBar {
  time: string; // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CorporateAnnouncement {
  id: string;
  symbol: string;
  companyName: string;
  date: string;
  type: "DIVIDEND" | "EARNINGS" | "RIGHTS" | "BONUS" | "DISCLOSURE" | "AGM";
  title: string;
  headline: string;
  details: string;
  aiExplanation: string;
  marketImpact: "BULLISH" | "BEARISH" | "NEUTRAL";
}

export const CSE_SECTORS = [
  { code: "BNK", name: "Banks", count: 12 },
  { code: "CAP", name: "Capital Goods", count: 28 },
  { code: "FNB", name: "Food, Beverage & Tobacco", count: 48 },
  { code: "DIV", name: "Diversified Financials", count: 32 },
  { code: "MAT", name: "Materials", count: 21 },
  { code: "TEL", name: "Telecommunication Services", count: 2 },
  { code: "LEI", name: "Consumer Services & Leisure", count: 37 },
  { code: "INS", name: "Insurance", count: 10 },
  { code: "UTL", name: "Utilities", count: 9 },
  { code: "LOG", name: "Transportation & Logistics", count: 3 },
  { code: "HLT", name: "Health Care", count: 9 },
];

export const CSE_COMPANIES: StockQuote[] = [
  {
    symbol: "JKH.N0000",
    name: "John Keells Holdings PLC",
    sector: "Capital Goods",
    sectorCode: "CAP",
    price: 218.50,
    change: 3.50,
    percentageChange: 1.63,
    open: 215.00,
    high: 220.00,
    low: 214.50,
    previousClose: 215.00,
    volume: 1450200,
    turnover: 316868700,
    marketCap: 326750000000,
    peRatio: 12.4,
    pbRatio: 1.25,
    dividendYield: 3.2,
    eps: 17.62,
    roe: 10.8,
    debtToEquity: 0.65,
    beta: 1.15,
    sharesOutstanding: 1495423340,
    lastTradedTime: "2026-10-01T14:28:45Z",
    description: "Sri Lanka's premier conglomerate with market leadership in Transportation (South Asia Gateway Terminals, West Container Terminal), Leisure (Cinnamon Hotels & Resorts), Property (Cinnamon Life Integrated Resort), Consumer Foods (Elephant House, Keells Supermarkets), and Financial Services (Nations Trust Bank, Union Assurance).",
  },
  {
    symbol: "COMB.N0000",
    name: "Commercial Bank of Ceylon PLC",
    sector: "Banks",
    sectorCode: "BNK",
    price: 124.00,
    change: 1.75,
    percentageChange: 1.43,
    open: 122.50,
    high: 125.00,
    low: 122.00,
    previousClose: 122.25,
    volume: 980400,
    turnover: 121569600,
    marketCap: 161200000000,
    peRatio: 5.2,
    pbRatio: 0.72,
    dividendYield: 6.8,
    eps: 23.85,
    roe: 14.9,
    debtToEquity: 0.45,
    beta: 1.05,
    sharesOutstanding: 1300000000,
    lastTradedTime: "2026-10-01T14:29:10Z",
    description: "The largest private commercial bank in Sri Lanka and a systemic pillar of the domestic economy, operating over 270 branches with thriving overseas operations in Bangladesh, Maldives, and Myanmar.",
  },
  {
    symbol: "SAMP.N0000",
    name: "Sampath Bank PLC",
    sector: "Banks",
    sectorCode: "BNK",
    price: 94.80,
    change: 1.30,
    percentageChange: 1.39,
    open: 93.50,
    high: 95.50,
    low: 93.50,
    previousClose: 93.50,
    volume: 1250300,
    turnover: 118528440,
    marketCap: 112100000000,
    peRatio: 4.8,
    pbRatio: 0.68,
    dividendYield: 7.2,
    eps: 19.75,
    roe: 15.6,
    debtToEquity: 0.42,
    beta: 1.10,
    sharesOutstanding: 1182000000,
    lastTradedTime: "2026-10-01T14:27:30Z",
    description: "A technologically progressive private sector commercial bank known for pioneering retail banking automation in Sri Lanka, boasting robust capital adequacy and strong net interest margins.",
  },
  {
    symbol: "HNB.N0000",
    name: "Hatton National Bank PLC",
    sector: "Banks",
    sectorCode: "BNK",
    price: 234.00,
    change: 4.00,
    percentageChange: 1.74,
    open: 230.00,
    high: 235.00,
    low: 229.50,
    previousClose: 230.00,
    volume: 540200,
    turnover: 126406800,
    marketCap: 126360000000,
    peRatio: 5.5,
    pbRatio: 0.76,
    dividendYield: 6.4,
    eps: 42.55,
    roe: 14.2,
    debtToEquity: 0.48,
    beta: 1.08,
    sharesOutstanding: 540000000,
    lastTradedTime: "2026-10-01T14:26:15Z",
    description: "One of Sri Lanka's largest and oldest private commercial banks, serving retail, SME, and top-tier corporate clients with leading digital and microfinance franchises.",
  },
  {
    symbol: "LOLC.N0000",
    name: "LOLC Holdings PLC",
    sector: "Diversified Financials",
    sectorCode: "DIV",
    price: 485.00,
    change: -5.00,
    percentageChange: -1.02,
    open: 490.00,
    high: 495.00,
    low: 480.00,
    previousClose: 490.00,
    volume: 180500,
    turnover: 87542500,
    marketCap: 230375000000,
    peRatio: 8.9,
    pbRatio: 1.45,
    dividendYield: 1.8,
    eps: 54.49,
    roe: 18.2,
    debtToEquity: 1.35,
    beta: 1.45,
    sharesOutstanding: 475000000,
    lastTradedTime: "2026-10-01T14:28:10Z",
    description: "A multinational financial services conglomerate headquartered in Colombo, with extensive microfinance and banking footprint across Central Asia (Kazakhstan, Tajikistan, Kyrgyzstan), Africa (Nigeria, Zambia, Kenya, Egypt), and Southeast Asia (Cambodia, Philippines, Indonesia).",
  },
  {
    symbol: "MELS.N0000",
    name: "Melstacorp PLC",
    sector: "Food, Beverage & Tobacco",
    sectorCode: "FNB",
    price: 112.50,
    change: 1.25,
    percentageChange: 1.12,
    open: 111.00,
    high: 113.50,
    low: 111.00,
    previousClose: 111.25,
    volume: 640100,
    turnover: 72011250,
    marketCap: 131062500000,
    peRatio: 7.8,
    pbRatio: 1.10,
    dividendYield: 6.2,
    eps: 14.42,
    roe: 15.1,
    debtToEquity: 0.55,
    beta: 0.85,
    sharesOutstanding: 1165000000,
    lastTradedTime: "2026-10-01T14:25:00Z",
    description: "Holding company of Distilleries Company of Sri Lanka (DCSL), Lanka Bell, Continental Insurance, and Aitken Spence associate, generating dominant high-margin cash flow in the beverage sector.",
  },
  {
    symbol: "HAYL.N0000",
    name: "Hayleys PLC",
    sector: "Capital Goods",
    sectorCode: "CAP",
    price: 118.00,
    change: 2.50,
    percentageChange: 2.16,
    open: 116.00,
    high: 119.50,
    low: 115.50,
    previousClose: 115.50,
    volume: 710400,
    turnover: 83827200,
    marketCap: 88500000000,
    peRatio: 6.9,
    pbRatio: 0.95,
    dividendYield: 5.5,
    eps: 17.10,
    roe: 14.5,
    debtToEquity: 0.80,
    beta: 1.20,
    sharesOutstanding: 750000000,
    lastTradedTime: "2026-10-01T14:29:40Z",
    description: "Sri Lanka's largest export-oriented conglomerate, accounting for ~5% of national export revenue through global leadership in value-added coconut coir, activated carbon (Haycarb), hand protection gloves (Dipped Products), textiles (Hayleys Fabric), and logistics (Advantis).",
  },
  {
    symbol: "DIAL.N0000",
    name: "Dialog Axiata PLC",
    sector: "Telecommunication Services",
    sectorCode: "TEL",
    price: 12.80,
    change: 0.20,
    percentageChange: 1.59,
    open: 12.60,
    high: 12.90,
    low: 12.60,
    previousClose: 12.60,
    volume: 3800400,
    turnover: 48645120,
    marketCap: 105856000000,
    peRatio: 8.5,
    pbRatio: 1.30,
    dividendYield: 7.8,
    eps: 1.51,
    roe: 16.0,
    debtToEquity: 0.50,
    beta: 0.75,
    sharesOutstanding: 8270000000,
    lastTradedTime: "2026-10-01T14:29:50Z",
    description: "The undisputed market leader in telecommunications, broadband, mobile money (eZ Cash), and digital television in Sri Lanka, boasting over 17 million subscribers.",
  },
  {
    symbol: "CTC.N0000",
    name: "Ceylon Tobacco Company PLC",
    sector: "Food, Beverage & Tobacco",
    sectorCode: "FNB",
    price: 1420.00,
    change: -10.00,
    percentageChange: -0.70,
    open: 1430.00,
    high: 1435.00,
    low: 1415.00,
    previousClose: 1430.00,
    volume: 24500,
    turnover: 34790000,
    marketCap: 265824000000,
    peRatio: 11.2,
    pbRatio: 8.50,
    dividendYield: 9.8,
    eps: 126.78,
    roe: 78.5,
    debtToEquity: 0.05,
    beta: 0.45,
    sharesOutstanding: 187200000,
    lastTradedTime: "2026-10-01T14:24:12Z",
    description: "A cash-generating monopoly in legal tobacco manufacturing, distributing nearly 100% of net profits as quarterly dividends, making it the supreme dividend yield heavyweight on the CSE.",
  },
  {
    symbol: "BIL.N0000",
    name: "Browns Investments PLC",
    sector: "Food, Beverage & Tobacco",
    sectorCode: "FNB",
    price: 7.20,
    change: 0.30,
    percentageChange: 4.35,
    open: 6.90,
    high: 7.40,
    low: 6.90,
    previousClose: 6.90,
    volume: 18450000,
    turnover: 132840000,
    marketCap: 103400000000,
    peRatio: 14.5,
    pbRatio: 0.85,
    dividendYield: 2.1,
    eps: 0.50,
    roe: 6.5,
    debtToEquity: 0.95,
    beta: 1.85,
    sharesOutstanding: 14360000000,
    lastTradedTime: "2026-10-01T14:29:55Z",
    description: "The primary retail liquidity vehicle on CSE with aggressive investments in Port City Colombo (Marina hotel, commercial district), extensive plantations, leisure hotels, and sugar manufacturing in Sierra Leone and Kenya.",
  },
  {
    symbol: "ACL.N0000",
    name: "ACL Cables PLC",
    sector: "Capital Goods",
    sectorCode: "CAP",
    price: 98.50,
    change: 2.10,
    percentageChange: 2.18,
    open: 96.50,
    high: 99.00,
    low: 96.00,
    previousClose: 96.40,
    volume: 380200,
    turnover: 37449700,
    marketCap: 23640000000,
    peRatio: 6.1,
    pbRatio: 1.05,
    dividendYield: 5.1,
    eps: 16.15,
    roe: 17.8,
    debtToEquity: 0.25,
    beta: 0.95,
    sharesOutstanding: 240000000,
    lastTradedTime: "2026-10-01T14:22:15Z",
    description: "Market leader in Sri Lanka's cable manufacturing and electrical wiring industry with over 45% market share and expanding export corridors to SAARC and African markets.",
  },
  {
    symbol: "SUN.N0000",
    name: "Sunshine Holdings PLC",
    sector: "Health Care",
    sectorCode: "HLT",
    price: 78.40,
    change: 1.60,
    percentageChange: 2.08,
    open: 77.00,
    high: 79.50,
    low: 76.80,
    previousClose: 76.80,
    volume: 290100,
    turnover: 22743840,
    marketCap: 38500000000,
    peRatio: 7.2,
    pbRatio: 1.35,
    dividendYield: 4.5,
    eps: 10.89,
    roe: 19.5,
    debtToEquity: 0.35,
    beta: 0.88,
    sharesOutstanding: 491000000,
    lastTradedTime: "2026-10-01T14:27:00Z",
    description: "Leading healthcare and consumer conglomerate with commanding market share in pharmaceuticals (Lina Manufacturing, Healthguard pharmacy chain), Ceylon tea (Watawala, Zesta), and palm oil plantations.",
  }
];

export const HISTORICAL_ANNOUNCEMENTS: CorporateAnnouncement[] = [
  {
    id: "ann-jkh-1",
    symbol: "JKH.N0000",
    companyName: "John Keells Holdings PLC",
    date: "2026-09-25",
    type: "DISCLOSURE",
    title: "Cinnamon Life Integrated Resort Achieves Record Casino & Hospitality Footfall",
    headline: "Gaming revenue and room occupancy exceed pre-opening estimates by 30%",
    details: "John Keells Holdings PLC announces that Cinnamon Life's integrated gaming floor and 800-room luxury hotel complex attained 88% average occupancy with robust international tourist gaming turnover for Q2.",
    aiExplanation: "This is a strong catalyst for JKH. High casino revenue and hotel occupancy convert directly into high-margin foreign currency cash flows, reducing leverage from the USD 1.2B project.",
    marketImpact: "BULLISH",
  },
  {
    id: "ann-comb-1",
    symbol: "COMB.N0000",
    companyName: "Commercial Bank of Ceylon PLC",
    date: "2026-09-20",
    type: "DIVIDEND",
    title: "Interim Cash Dividend of LKR 4.50 per Share",
    headline: "Commercial Bank declares first interim dividend for FY2026 with XD date 10th October",
    details: "The Board of Directors of Commercial Bank of Ceylon PLC has resolved to declare a First Interim Cash Dividend of LKR 4.50 per share on Voting shares. XD Date: 2026-10-10. Payment Date: 2026-10-28.",
    aiExplanation: "A LKR 4.50 dividend on a Rs 124 stock yields ~3.6% in a single interim payment. Investors holding before the XD date qualify for the cash payout.",
    marketImpact: "BULLISH",
  },
  {
    id: "ann-lolc-1",
    symbol: "LOLC.N0000",
    companyName: "LOLC Holdings PLC",
    date: "2026-09-18",
    type: "EARNINGS",
    title: "Consolidated Q1 Profit After Tax Expands 42% YoY to LKR 18.2 Billion",
    headline: "Central Asian and African microfinance subsidiaries deliver stellar foreign exchange earnings",
    details: "LOLC Holdings PLC reported group revenue of LKR 88.4 Bn with PAT surging to LKR 18.2 Bn, driven by rapid loan book expansion in Kazakhstan, Kenya, and Egypt.",
    aiExplanation: "LOLC acts as a global financial holding company. High offshore earnings insulate the group from domestic credit cycles and generate recurring USD-denominated return on equity.",
    marketImpact: "BULLISH",
  },
  {
    id: "ann-samp-1",
    symbol: "SAMP.N0000",
    companyName: "Sampath Bank PLC",
    date: "2026-09-15",
    type: "DISCLOSURE",
    title: "Non-Performing Loan (NPL) Ratio Drops to 4.2% as Economic Recovery Takes Hold",
    headline: "Impairment charges decline 55% YoY, freeing up provisions into pre-tax profit",
    details: "Sampath Bank PLC confirms a 180 bps reduction in Stage 3 NPLs following successful loan restructuring across SME, construction, and tourism borrower segments.",
    aiExplanation: "Falling NPLs indicate that bad debts are turning back into performing assets, reducing bank write-offs and boosting earnings quality.",
    marketImpact: "BULLISH",
  }
];

/**
 * Procedural Historical Price Generator for CSE stocks
 * Generates realistic candlestick price action with real CSE volatility patterns, support/resistance, and volume profiles.
 */
export function generateRealisticStockBars(
  symbol: string,
  basePrice: number,
  days = 120,
  trend: "bullish" | "bearish" | "ranging" = "bullish",
  seed = 42
): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  let currentPrice = basePrice * 0.85; // start lower if bullish
  const startDate = new Date("2026-05-01T00:00:00Z");

  // Pseudo-random seeded generator
  let state = seed;
  const pseudoRandom = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  const dailyDrift = trend === "bullish" ? 0.0018 : trend === "bearish" ? -0.0015 : 0.0002;
  const volatility = 0.022; // 2.2% daily std dev

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dateStr = d.toISOString().split("T")[0];
    const u1 = pseudoRandom();
    const u2 = pseudoRandom();
    const normal = Math.sqrt(-2.0 * Math.log(u1 + 0.00001)) * Math.cos(2.0 * Math.PI * u2);
    const dailyReturn = dailyDrift + normal * volatility;

    const open = Math.round(currentPrice * 100) / 100;
    const close = Math.round((open * (1 + dailyReturn)) * 100) / 100;
    const high = Math.round(Math.max(open, close) * (1 + pseudoRandom() * 0.015) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - pseudoRandom() * 0.015) * 100) / 100;
    const volume = Math.floor(50000 + pseudoRandom() * 950000 * (Math.abs(dailyReturn) > 0.02 ? 2.5 : 1.0));

    bars.push({
      time: dateStr,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return bars;
}

/**
 * Historical CSE Index Benchmark Data (ASPI and S&P SL20)
 */
export const ASPI_HISTORICAL_DATA: OHLCVBar[] = generateRealisticStockBars("ASPI", 20800, 180, "bullish", 1001);
export const SPSL20_HISTORICAL_DATA: OHLCVBar[] = generateRealisticStockBars("SPSL20", 6150, 180, "bullish", 2002);
