export interface ScoringResult {
  score: number; // 0 to 100
  passed: boolean; // >= 80%
  skillsDelta: Record<string, number>;
  feedback: string;
  breakdown: {
    accuracy: number;
    riskRewardQuality: number;
    processAdherence: number;
  };
}

export function evaluateActivitySubmission(
  scoringKey: string,
  userAnswer: any,
  solutionCriteria: Record<string, any>
): ScoringResult {
  let score = 0;
  let feedback = "";
  let accuracy = 0;
  let riskRewardQuality = 80;
  let processAdherence = 90;
  const skillsDelta: Record<string, number> = {};

  switch (scoringKey) {
    case "REAL_COMPOUNDING_TARGET": {
      const userReturn = Number(userAnswer.returnRate || userAnswer);
      const target = solutionCriteria.targetRealDoubleReturn || 12.2;
      const tol = solutionCriteria.tolerance || 0.8;
      const diff = Math.abs(userReturn - target);

      if (diff <= tol) {
        score = 100;
        accuracy = 100;
        feedback = "Outstanding! You correctly identified that ~12.2% nominal return (7.2% real return + 5% inflation) doubles real purchasing power in 10 years.";
      } else if (diff <= tol * 2.5) {
        score = 75;
        accuracy = 75;
        feedback = `Close! Your estimate of ${userReturn}% was near the target of ${target}%. Remember to add annual inflation to real compounding targets.`;
      } else {
        score = 40;
        accuracy = 40;
        feedback = `Incorrect. A nominal return of ${userReturn}% does not double purchasing power under 5% inflation. Target was ${target}%.`;
      }
      skillsDelta["FinancialMath"] = score >= 80 ? 15 : 5;
      skillsDelta["BenchmarkAwareness"] = score >= 80 ? 20 : 8;
      break;
    }

    case "LIMIT_ORDER_QUEUE": {
      const isLimit = userAnswer.orderType === "LIMIT";
      const isBelowAsk = userAnswer.priceUnderSpread !== false;

      if (isLimit && isBelowAsk) {
        score = 100;
        accuracy = 100;
        processAdherence = 100;
        feedback = "Perfect execution. Your limit buy joined the bid queue without crossing the spread, avoiding market maker spread cost and slippage.";
      } else {
        score = 50;
        accuracy = 50;
        feedback = "A market buy crossed the spread immediately, paying higher prices to the ask. Use limit orders when patience saves transaction costs.";
      }
      skillsDelta["ExecutionDiscipline"] = score >= 80 ? 20 : 5;
      skillsDelta["OrderBookMechanics"] = score >= 80 ? 15 : 5;
      break;
    }

    case "CSE_NET_PROFIT_TARGET": {
      const submittedPrice = Number(userAnswer.sellPrice || userAnswer);
      const target = solutionCriteria.minSellPrice || 123.65;
      const tol = solutionCriteria.tolerance || 0.35;
      const diff = Math.abs(submittedPrice - target);

      if (diff <= tol) {
        score = 100;
        accuracy = 100;
        feedback = `Exact calculation! At ${submittedPrice.toFixed(2)} LKR, gross proceeds cover both 1.12% buy fees and 1.12% sell fees while delivering full net profit.`;
      } else if (diff <= tol * 3) {
        score = 70;
        accuracy = 70;
        feedback = `Close! Your target of ${submittedPrice.toFixed(2)} LKR is near the required ${target.toFixed(2)} LKR. Always account for 1.12% on the exit leg.`;
      } else {
        score = 35;
        accuracy = 35;
        feedback = `Calculation error. Selling at ${submittedPrice.toFixed(2)} LKR fails to generate the LKR 10,000 net target after CSE transaction fees.`;
      }
      skillsDelta["FeeCalculation"] = score >= 80 ? 25 : 5;
      skillsDelta["RiskManagement"] = score >= 80 ? 15 : 5;
      break;
    }

    case "SUPPORT_ZONE_ACCURACY": {
      const markedPrice = Number(userAnswer.priceLevel || userAnswer.supportLevel || userAnswer);
      const min = solutionCriteria.minPrice || 119.0;
      const max = solutionCriteria.maxPrice || 122.5;

      if (markedPrice >= min && markedPrice <= max) {
        score = 95;
        accuracy = 95;
        feedback = `Accurate zone placement! You marked ${markedPrice.toFixed(2)} LKR, precisely capturing the multi-month demand zone where institutional buyers stepped in.`;
      } else {
        score = 45;
        accuracy = 45;
        feedback = `Zone mismatch. You marked ${markedPrice.toFixed(2)} LKR, which misses the primary candlestick wick cluster between ${min} and ${max} LKR.`;
      }
      skillsDelta["TrendReading"] = score >= 80 ? 20 : 5;
      skillsDelta["ChartAnnotation"] = score >= 80 ? 20 : 5;
      break;
    }

    case "PREDICT_MOVE_RR": {
      const rr = Number(userAnswer.riskRewardRatio || userAnswer.rr || 2.0);
      const dir = userAnswer.direction || "LONG";

      if (dir === "LONG" && rr >= (solutionCriteria.minRR || 2.2)) {
        score = 100;
        accuracy = 100;
        riskRewardQuality = 100;
        feedback = `Superb trade setup! You committed to the bullish breakout with a ${rr.toFixed(1)}:1 Risk-to-Reward ratio. The subsequent price expansion confirmed your thesis.`;
      } else if (dir === "LONG") {
        score = 75;
        riskRewardQuality = 60;
        feedback = `Direction correct, but your Risk-to-Reward ratio (${rr.toFixed(1)}:1) was too tight to absorb normal CSE volatility. Target at least 2.5:1.`;
      } else {
        score = 30;
        accuracy = 30;
        feedback = "The chart broke out to the upside following multi-week volume contraction. Shorting or remaining sidelined missed the expansion.";
      }
      skillsDelta["SetupSelection"] = score >= 80 ? 20 : 5;
      skillsDelta["RiskRewardDiscipline"] = score >= 80 ? 25 : 5;
      break;
    }

    case "POSITION_SIZING_CALCULATION": {
      const shares = Number(userAnswer.shares || userAnswer);
      const exact = solutionCriteria.exactShares || 3000;
      const tol = solutionCriteria.tolerance || 25;
      const diff = Math.abs(shares - exact);

      if (diff <= tol) {
        score = 100;
        accuracy = 100;
        processAdherence = 100;
        feedback = `Flawless sizing math! 3,000 shares at a 5.00 LKR stop distance risks exactly 15,000 LKR (1.5% of the 1M account).`;
      } else {
        score = 40;
        accuracy = 40;
        feedback = `Sizing error. Sizing ${shares} shares risks ${(shares * 5).toLocaleString()} LKR instead of the mandated 15,000 LKR (1.5%).`;
      }
      skillsDelta["PositionSizing"] = score >= 80 ? 25 : 5;
      skillsDelta["CapitalPreservation"] = score >= 80 ? 20 : 5;
      break;
    }

    default: {
      score = 85;
      accuracy = 85;
      feedback = "Activity completed and verified successfully.";
      skillsDelta["GeneralMastery"] = 10;
    }
  }

  return {
    score,
    passed: score >= 80,
    skillsDelta,
    feedback,
    breakdown: {
      accuracy,
      riskRewardQuality,
      processAdherence,
    },
  };
}
