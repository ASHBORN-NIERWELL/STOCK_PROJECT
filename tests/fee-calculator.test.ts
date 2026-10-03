import { describe, it, expect } from "vitest";
import { calculateCSEFees, calculateBreakEven, getCSETickSize, CSE_RATES } from "../src/lib/cse/fee-calculator";

describe("CSE Fee Calculator Engine", () => {
  it("should correctly compute standard 1.12% fees on retail trade under 100M LKR", () => {
    const tradeValue = 100000; // 100,000 LKR
    const buyFees = calculateCSEFees(tradeValue, "BUY");

    expect(buyFees.brokerageFee).toBe(640); // 0.64% of 100,000 = 640 LKR
    expect(buyFees.secCess).toBe(72);      // 0.072% of 100,000 = 72 LKR
    expect(buyFees.cseFee).toBe(84);       // 0.084% of 100,000 = 84 LKR
    expect(buyFees.cdsFee).toBe(24);       // 0.024% of 100,000 = 24 LKR
    expect(buyFees.shareTransactionLevy).toBe(300); // 0.30% of 100,000 = 300 LKR
    expect(buyFees.totalFees).toBe(1120);  // Total 1.12% = 1,120 LKR
    expect(buyFees.effectiveRatePercentage).toBe(1.12);
    expect(buyFees.netTradeAmount).toBe(101120); // Buy net outlay = 100,000 + 1,120
  });

  it("should apply minimum brokerage of LKR 25 for very small trades", () => {
    const tradeValue = 1000; // 1,000 LKR
    const buyFees = calculateCSEFees(tradeValue, "BUY");

    // Standard 0.64% would be 6.40 LKR, which is below the 25 LKR minimum
    expect(buyFees.brokerageFee).toBe(25);
    expect(buyFees.totalFees).toBeGreaterThan(11.20);
  });

  it("should compute round-trip break-even price correctly", () => {
    const purchasePrice = 100; // 100 LKR per share
    const shares = 1000;
    const breakEven = calculateBreakEven(purchasePrice, shares);

    // Initial outlay = 100,000 + 1,120 = 101,120 LKR
    // Break-even sell price must cover 101,120 after 1.12% sell fee:
    // 101,120 / (1 - 0.0112) / 1000 = 102.265 => 102.27 LKR (+2.27%)
    expect(breakEven.breakEvenSellPrice).toBeCloseTo(102.27, 1);
    expect(breakEven.requiredPriceIncreasePercent).toBeCloseTo(2.27, 1);
  });

  it("should identify correct CSE tick sizes based on stock price", () => {
    expect(getCSETickSize(45.50)).toBe(0.10);  // Under Rs 100
    expect(getCSETickSize(215.00)).toBe(0.25); // Rs 100 to 500
    expect(getCSETickSize(650.00)).toBe(0.50); // Rs 500 to 1000
    expect(getCSETickSize(1420.00)).toBe(1.00); // Above Rs 1000
  });
});
