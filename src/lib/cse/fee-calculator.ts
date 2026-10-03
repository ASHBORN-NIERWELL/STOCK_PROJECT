/**
 * Colombo Stock Exchange (CSE) Fee & Transaction Cost Engine
 *
 * Current CSE Fee Structure (Updated and Verified: 2026):
 * For Equity Transactions up to LKR 100,000,000:
 * - Brokerage Fee: 0.640% (Min LKR 25)
 * - SEC Cess (Securities and Exchange Commission): 0.072%
 * - CSE Fee: 0.084%
 * - CDS Fee (Central Depository Systems): 0.024%
 * - Share Transaction Levy (STL - Inland Revenue Dept): 0.300%
 * Total Standard Transaction Cost: 1.120% (112 basis points)
 *
 * For Transactions exceeding LKR 100,000,000 (Tier 2):
 * - Brokerage: 0.200% (negotiated floor)
 * - SEC Cess: 0.040%
 * - CSE Fee: 0.0525%
 * - CDS Fee: 0.020%
 * - STL: 0.300%
 * Total Tier 2 Cost: ~0.6125%
 */

export interface CSEFeeBreakdown {
  tradeValue: number;
  brokerageFee: number;
  secCess: number;
  cseFee: number;
  cdsFee: number;
  shareTransactionLevy: number;
  totalFees: number;
  effectiveRatePercentage: number;
  netTradeAmount: number; // For BUY: tradeValue + totalFees; For SELL: tradeValue - totalFees
  tier: "Standard (Up to 100M)" | "Institutional (> 100M)";
}

export interface BreakEvenAnalysis {
  purchasePrice: number;
  shares: number;
  initialInvestment: number;
  buyFees: number;
  breakEvenSellPrice: number;
  breakEvenGrossProceeds: number;
  requiredPriceIncreaseLKR: number;
  requiredPriceIncreasePercent: number;
}

export const CSE_RATES = {
  STANDARD_TIER_MAX: 100_000_000,
  MINIMUM_BROKERAGE_LKR: 25.0,
  LAST_VERIFIED_DATE: "2026-10-01",
  STANDARD: {
    BROKERAGE: 0.0064, // 0.64%
    SEC_CESS: 0.00072,  // 0.072%
    CSE_FEE: 0.00084,   // 0.084%
    CDS_FEE: 0.00024,   // 0.024%
    STL: 0.0030,        // 0.30%
    TOTAL_RATE: 0.0112, // 1.12%
  },
  INSTITUTIONAL: {
    BROKERAGE: 0.0020,  // 0.20%
    SEC_CESS: 0.0004,   // 0.04%
    CSE_FEE: 0.000525,  // 0.0525%
    CDS_FEE: 0.0002,    // 0.02%
    STL: 0.0030,        // 0.30%
    TOTAL_RATE: 0.006125, // 0.6125%
  },
};

/**
 * Calculates itemized CSE transaction fees for a given trade value and side.
 */
export function calculateCSEFees(tradeValue: number, side: "BUY" | "SELL"): CSEFeeBreakdown {
  if (tradeValue <= 0) {
    return {
      tradeValue: 0,
      brokerageFee: 0,
      secCess: 0,
      cseFee: 0,
      cdsFee: 0,
      shareTransactionLevy: 0,
      totalFees: 0,
      effectiveRatePercentage: 0,
      netTradeAmount: 0,
      tier: "Standard (Up to 100M)",
    };
  }

  const isInstitutional = tradeValue > CSE_RATES.STANDARD_TIER_MAX;
  const rates = isInstitutional ? CSE_RATES.INSTITUTIONAL : CSE_RATES.STANDARD;

  let brokerageFee = tradeValue * rates.BROKERAGE;
  if (!isInstitutional && brokerageFee < CSE_RATES.MINIMUM_BROKERAGE_LKR) {
    brokerageFee = CSE_RATES.MINIMUM_BROKERAGE_LKR;
  }

  const secCess = tradeValue * rates.SEC_CESS;
  const cseFee = tradeValue * rates.CSE_FEE;
  const cdsFee = tradeValue * rates.CDS_FEE;
  const shareTransactionLevy = tradeValue * rates.STL;

  const totalFees = brokerageFee + secCess + cseFee + cdsFee + shareTransactionLevy;
  const effectiveRatePercentage = (totalFees / tradeValue) * 100;
  const netTradeAmount = side === "BUY" ? tradeValue + totalFees : tradeValue - totalFees;

  return {
    tradeValue: Math.round(tradeValue * 100) / 100,
    brokerageFee: Math.round(brokerageFee * 100) / 100,
    secCess: Math.round(secCess * 100) / 100,
    cseFee: Math.round(cseFee * 100) / 100,
    cdsFee: Math.round(cdsFee * 100) / 100,
    shareTransactionLevy: Math.round(shareTransactionLevy * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    effectiveRatePercentage: Math.round(effectiveRatePercentage * 1000) / 1000,
    netTradeAmount: Math.round(netTradeAmount * 100) / 100,
    tier: isInstitutional ? "Institutional (> 100M)" : "Standard (Up to 100M)",
  };
}

/**
 * Calculates the exact price a stock must reach to cover both BUY and SELL CSE fees (Round-Trip Break-Even).
 */
export function calculateBreakEven(purchasePrice: number, shares: number): BreakEvenAnalysis {
  if (purchasePrice <= 0 || shares <= 0) {
    return {
      purchasePrice: 0,
      shares: 0,
      initialInvestment: 0,
      buyFees: 0,
      breakEvenSellPrice: 0,
      breakEvenGrossProceeds: 0,
      requiredPriceIncreaseLKR: 0,
      requiredPriceIncreasePercent: 0,
    };
  }

  const tradeValue = purchasePrice * shares;
  const buyFees = calculateCSEFees(tradeValue, "BUY");
  const totalOutlay = buyFees.netTradeAmount; // price*shares + buyFees

  // To break even on sell:
  // Net Sell Proceeds = SellValue - SellFees(SellValue) = totalOutlay
  // SellValue * (1 - rate) = totalOutlay  =>  SellValue = totalOutlay / (1 - rate)
  const sellRate = tradeValue > CSE_RATES.STANDARD_TIER_MAX ? CSE_RATES.INSTITUTIONAL.TOTAL_RATE : CSE_RATES.STANDARD.TOTAL_RATE;
  const breakEvenGrossProceeds = totalOutlay / (1 - sellRate);
  const breakEvenSellPrice = breakEvenGrossProceeds / shares;

  const requiredPriceIncreaseLKR = breakEvenSellPrice - purchasePrice;
  const requiredPriceIncreasePercent = ((breakEvenSellPrice - purchasePrice) / purchasePrice) * 100;

  return {
    purchasePrice,
    shares,
    initialInvestment: tradeValue,
    buyFees: buyFees.totalFees,
    breakEvenSellPrice: Math.round(breakEvenSellPrice * 100) / 100,
    breakEvenGrossProceeds: Math.round(breakEvenGrossProceeds * 100) / 100,
    requiredPriceIncreaseLKR: Math.round(requiredPriceIncreaseLKR * 100) / 100,
    requiredPriceIncreasePercent: Math.round(requiredPriceIncreasePercent * 1000) / 1000,
  };
}

/**
 * Calculates standard CSE lot size and tick size constraints.
 */
export function getCSETickSize(price: number): number {
  if (price <= 0) return 0.10;
  if (price < 100) return 0.10; // Under Rs 100: 10 cents
  if (price < 500) return 0.25; // Rs 100 to 500: 25 cents
  if (price < 1000) return 0.50; // Rs 500 to 1000: 50 cents
  return 1.00; // Above Rs 1000: Rs 1.00
}

export function roundToCSETick(price: number): number {
  const tick = getCSETickSize(price);
  return Math.round(price / tick) * tick;
}
