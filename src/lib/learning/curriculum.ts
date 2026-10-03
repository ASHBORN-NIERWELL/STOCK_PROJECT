export interface LessonSpec {
  id: string;
  level: number;
  moduleIndex: number;
  title: string;
  category: "FOUNDATION" | "TECHNICAL" | "FUNDAMENTAL" | "RISK" | "PSYCHOLOGY" | "STRATEGY" | "MACRO" | "MASTERY";
  estimatedMinutes: number;
  summary: string;
  learningObjectives: string[];
  hook: {
    title: string;
    scenario: string;
    symbol?: string;
    chartTimeframe?: string;
  };
  explore: {
    instruction: string;
    activityType:
      | "CHART_ANNOTATION"
      | "PREDICT_NEXT_MOVE"
      | "INDICATOR_PLAYGROUND"
      | "FEE_SIMULATOR"
      | "POSITION_SIZING"
      | "FUNDAMENTAL_WORKBENCH"
      | "FINANCIAL_STATEMENTS"
      | "ORDER_BOOK_SIM"
      | "MONTE_CARLO_RUIN"
      | "PORTFOLIO_BUILDER"
      | "NEWS_REACTION"
      | "BIAS_SPOTTER"
      | "CASE_STUDY"
      | "STRATEGY_BUILDER"
      | "TEACH_BACK";
    initialConfig: Record<string, any>;
  };
  explain: {
    concept: string;
    keyPoints: string[];
    sriLankanContext: string;
    tutorPromptSuggestion: string;
  };
  applyTask: {
    prompt: string;
    scoringKey: string;
    solutionCriteria: Record<string, any>;
    hints: string[];
  };
  reflectPrompt: string;
}

export const CURRICULUM_LEVELS = [
  {
    level: 0,
    title: "Level 0: Money Basics & Benchmarks",
    description: "Inflation, compounding, risk vs return, and Sri Lanka Treasury Bills as the benchmark to beat.",
    color: "#64748b",
    badge: "Foundation",
  },
  {
    level: 1,
    title: "Level 1: What a Stock Market Is",
    description: "Shares, ownership, Colombo Stock Exchange, ASPI/S&P SL20, price formation, and bid-ask order books.",
    color: "#3b82f6",
    badge: "Market Structure",
  },
  {
    level: 2,
    title: "Level 2: Sri Lankan Market Mechanics",
    description: "CDS accounts, broker selection, 09:30-14:30 SLST hours, T+2 settlement, 1.12% fees, XD dates & rights issues.",
    color: "#06b6d4",
    badge: "CSE Mechanics",
  },
  {
    level: 3,
    title: "Level 3: Reading the Market",
    description: "Candlesticks, volume dynamics, support & resistance zones, trends, and multi-timeframe analysis.",
    color: "#10b981",
    badge: "Price Action",
  },
  {
    level: 4,
    title: "Level 4: Fundamental Analysis",
    description: "Financial statements, EPS, P/E, P/B, ROE, debt ratios, dividend yield, and evaluating annual reports.",
    color: "#84cc16",
    badge: "Valuation",
  },
  {
    level: 5,
    title: "Level 5: Technical Indicators",
    description: "Moving averages, RSI, MACD, Bollinger Bands, volume indicators, and understanding indicator lag.",
    color: "#eab308",
    badge: "Indicators",
  },
  {
    level: 6,
    title: "Level 6: Risk Management & Capital Preservation",
    description: "Position sizing math, 2% risk rule, stop-loss mechanics, risk-to-reward ratios, and probability of ruin.",
    color: "#f97316",
    badge: "Risk Control",
  },
  {
    level: 7,
    title: "Level 7: Trading Strategies",
    description: "Value, dividend investing, momentum breakouts, and mean reversion tested on historical CSE datasets.",
    color: "#ef4444",
    badge: "Strategies",
  },
  {
    level: 8,
    title: "Level 8: Trading Psychology & Bias",
    description: "FOMO, loss aversion, overtrading, revenge trading, herd mentality, and the disposition effect.",
    color: "#ec4899",
    badge: "Psychology",
  },
  {
    level: 9,
    title: "Level 9: Portfolio Construction & Macro",
    description: "Sector diversification, interest rate cycles, USD/LKR currency shifts, and economic crisis navigations.",
    color: "#8b5cf6",
    badge: "Macro & Portfolio",
  },
  {
    level: 10,
    title: "Level 10: Mastery & Capstone",
    description: "Full written investment thesis defense, audit of trading journal, and real multi-day replay simulation.",
    color: "#a855f7",
    badge: "Mastery",
  },
];

export const ALL_LESSONS: LessonSpec[] = [
  // Level 0
  {
    id: "lvl0-m1-inflation-benchmark",
    level: 0,
    moduleIndex: 1,
    title: "The Benchmark to Beat: Inflation & Sri Lanka T-Bills",
    category: "FOUNDATION",
    estimatedMinutes: 12,
    summary: "Discover why doing nothing loses purchasing power to inflation, and why 12-Month CBSL T-Bills (~9.85%) are your benchmark.",
    learningObjectives: [
      "Understand the erosive impact of Sri Lankan inflation on cash holdings",
      "Calculate real returns vs nominal returns",
      "Set the 12-Month Treasury Bill yield as the hurdle rate for any equity investment",
    ],
    hook: {
      title: "The 10-Year LKR Cash Trap",
      scenario: "In 2016, you put LKR 1,000,000 in a savings account earning 3%. By 2026, goods that cost 1M cost over 2.6M. Explore how compounding and inflation change wealth.",
    },
    explore: {
      instruction: "Adjust the inflation and investment return sliders to see the diverging real purchasing power curves.",
      activityType: "FEE_SIMULATOR",
      initialConfig: {
        mode: "COMPOUNDING",
        initialAmount: 1000000,
        years: 10,
        annualReturnRate: 12,
        inflationRate: 5.5,
        benchmarkRate: 9.85,
      },
    },
    explain: {
      concept: "Inflation is the silent tax. If your investment does not generate a return higher than the risk-free Treasury bill rate plus inflation, you are taking stock risk for zero financial compensation.",
      keyPoints: [
        "Nominal Return - Inflation = Real Purchasing Power Return",
        "CBSL 12-Month T-Bills represent Sri Lanka's sovereign risk-free rate",
        "Equities must generate an Equity Risk Premium (ERP) over T-Bills to justify volatility",
      ],
      sriLankanContext: "During the 2022 crisis, CCPI inflation peaked at 69.8%, while T-bills spiked above 30%. In 2026, with inflation ~2.1% and T-bills ~9.85%, CSE stocks trading at 5x-9x P/E offer compelling real risk premia.",
      tutorPromptSuggestion: "Why shouldn't I just keep all my money in a 1-year fixed deposit or T-bill instead of the stock market?",
    },
    applyTask: {
      prompt: "Find the minimum annual return required on a LKR 1,000,000 portfolio to double your REAL purchasing power in 10 years given 5% annual inflation.",
      scoringKey: "REAL_COMPOUNDING_TARGET",
      solutionCriteria: {
        targetRealDoubleReturn: 12.2,
        tolerance: 0.8,
      },
      hints: [
        "Remember the Rule of 72: A real 7.2% return doubles real wealth in 10 years.",
        "Add expected inflation (5%) to the required real return (7.2%).",
      ],
    },
    reflectPrompt: "If risk-free T-bills pay 9.85%, what minimum net annual return do you demand from your stock portfolio to justify active risk?",
  },

  // Level 1
  {
    id: "lvl1-m1-cse-orderbook",
    level: 1,
    moduleIndex: 1,
    title: "Order Books, Bid/Ask Spread & Tick Sizes",
    category: "FOUNDATION",
    estimatedMinutes: 15,
    summary: "Interact with a live CSE limit order book simulator to understand how buyers and sellers form market prices.",
    learningObjectives: [
      "Understand the difference between Bid (buyer queue) and Ask (seller queue)",
      "Observe how Market Orders cross the spread while Limit Orders join the queue",
      "Learn CSE tick sizes (10 cents vs 25 cents vs 50 cents)",
    ],
    hook: {
      title: "Why did my market order fill higher than the last traded price?",
      scenario: "You placed a market buy order for 5,000 shares of JKH. The last trade was 218.50 LKR, but your average fill came out to 219.80 LKR. Discover why.",
    },
    explore: {
      instruction: "Place simulated market and limit orders into the live order book queue and observe fill execution and slippage.",
      activityType: "ORDER_BOOK_SIM",
      initialConfig: {
        symbol: "JKH.N0000",
        lastPrice: 218.50,
        spread: 0.50,
      },
    },
    explain: {
      concept: "Stock prices are not set by an algorithm; they are created when a buyer's willingness to pay meets a seller's willingness to sell. The highest price a buyer offers is the BID; the lowest price a seller asks is the ASK.",
      keyPoints: [
        "Market Buy orders immediately fill against the lowest available ASK orders (taking liquidity)",
        "Limit orders sit in the queue waiting for someone else to hit them (providing liquidity)",
        "Slippage happens when your order size exceeds the volume available at the best bid/ask",
      ],
      sriLankanContext: "On the CSE, many mid-cap and small-cap stocks have wide spreads (e.g. 50 cents to 1 Rupee). Placing large market orders on illiquid CSE counters causes severe slippage.",
      tutorPromptSuggestion: "When should I use a Limit order instead of a Market order on CSE?",
    },
    applyTask: {
      prompt: "Execute a limit buy order for 1,000 shares of COMB at 122.50 without crossing the spread, then explain how long it takes to fill.",
      scoringKey: "LIMIT_ORDER_QUEUE",
      solutionCriteria: {
        orderType: "LIMIT",
        priceUnderSpread: true,
      },
      hints: [
        "Check the current best Ask price. A limit buy below the best Ask will wait patiently in the queue.",
      ],
    },
    reflectPrompt: "Why does an active trader on CSE bleed money if they repeatedly buy at the market ask and sell at the market bid?",
  },

  // Level 2
  {
    id: "lvl2-m1-cse-fees-settlement",
    level: 2,
    moduleIndex: 1,
    title: "CSE Fee Math & T+2 Settlement Reality",
    category: "FOUNDATION",
    estimatedMinutes: 15,
    summary: "Master the exact 1.12% round-trip CSE cost breakdown (Brokerage, SEC, CSE, CDS, STL) and T+2 settlement.",
    learningObjectives: [
      "Break down every component of the 1.12% transaction cost",
      "Calculate the exact 2.27% price increase needed just to break even",
      "Understand T+2 settlement and cash availability for buying and selling",
    ],
    hook: {
      title: "The Illusion of 1% Profit",
      scenario: "You bought SAMP at 93.50 and sold it at 94.50 (+1.07%). You thought you made a profit, but your CDS account shows a net loss. Why?",
    },
    explore: {
      instruction: "Use the interactive break-even simulator to calculate the exact exit price required to overcome CSE transaction costs.",
      activityType: "FEE_SIMULATOR",
      initialConfig: {
        mode: "BREAK_EVEN",
        stockPrice: 93.50,
        shares: 1000,
      },
    },
    explain: {
      concept: "Every trade on the CSE incurs 1.12% in total fees upon purchase AND 1.12% upon sale. This means your stock must rise at least 2.27% just to reach zero net profit.",
      keyPoints: [
        "Brokerage: 0.640% (Min LKR 25)",
        "SEC Cess: 0.072% | CSE Fee: 0.084% | CDS Fee: 0.024%",
        "Share Transaction Levy (STL): 0.300%",
        "Round-trip break even: (1 + 0.0112) / (1 - 0.0112) - 1 = +2.265%",
      ],
      sriLankanContext: "Retail day traders who scalp 0.5% - 1% moves on CSE consistently go broke because fees consume their entire gross profit. Swing trading 8% - 20% swings is mathematically superior on CSE.",
      tutorPromptSuggestion: "How does T+2 settlement affect my ability to buy other stocks with sale proceeds?",
    },
    applyTask: {
      prompt: "If you purchase 2,000 shares of HAYL at LKR 116.00, calculate the exact minimum price you must sell at to make at least LKR 10,000 in clean net profit after all fees.",
      scoringKey: "CSE_NET_PROFIT_TARGET",
      solutionCriteria: {
        minSellPrice: 123.65,
        tolerance: 0.35,
      },
      hints: [
        "Total buy outlay = (116.00 * 2000) * 1.0112 = 234,600 LKR.",
        "Add target profit 10,000 = 244,600 net needed.",
        "Divide by (1 - 0.0112) = 247,370 gross / 2000 shares = 123.68 LKR.",
      ],
    },
    reflectPrompt: "Why is high-frequency day trading a losing game on a market with 1.12% single-leg friction?",
  },

  // Level 3
  {
    id: "lvl3-m1-support-resistance",
    level: 3,
    moduleIndex: 1,
    title: "Chart Anatomy: Support & Resistance Zones",
    category: "TECHNICAL",
    estimatedMinutes: 20,
    summary: "Draw horizontal support and resistance zones on real historical CSE candlestick charts and have automated code grade your accuracy.",
    learningObjectives: [
      "Identify swing highs and swing lows on candlestick charts",
      "Draw support zones where buying pressure previously halted declines",
      "Draw resistance zones where selling pressure halted rallies",
    ],
    hook: {
      title: "Commercial Bank's 120 LKR Floor",
      scenario: "Between June and September, COMB touched 120 LKR four separate times and bounced each time. Mark the zones on the chart.",
    },
    explore: {
      instruction: "Click and drag to draw horizontal support and resistance zones on the candlestick chart. Submit to see computed algorithmic levels overlay and score.",
      activityType: "CHART_ANNOTATION",
      initialConfig: {
        symbol: "COMB.N0000",
        task: "DRAW_SUPPORT_RESISTANCE",
        expectedSupportRange: [119.5, 122.0],
        expectedResistanceRange: [126.0, 128.5],
      },
    },
    explain: {
      concept: "Support and resistance are not exact lines; they are price zones where institutional and retail memory congregates. Support forms where demand exceeds supply; resistance forms where supply overwhelms demand.",
      keyPoints: [
        "Multiple touches without breaking strengthen the validity of a zone",
        "Role Reversal: Broken support frequently becomes new resistance",
        "Always wait for price confirmation (reversal candle) at key zones before entering",
      ],
      sriLankanContext: "On CSE bluechips like JKH and COMB, round psychological numbers (e.g. 100, 150, 200 LKR) frequently act as major institutional accumulation and distribution zones.",
      tutorPromptSuggestion: "How do I know if a support level is going to hold or break down?",
    },
    applyTask: {
      prompt: "Identify and mark the primary multi-month support zone for Commercial Bank (COMB) on the chart within a 2 LKR band.",
      scoringKey: "SUPPORT_ZONE_ACCURACY",
      solutionCriteria: {
        minPrice: 119.0,
        maxPrice: 122.5,
      },
      hints: [
        "Look for where the lowest wick clusters bounced between May and July.",
      ],
    },
    reflectPrompt: "Why is entering near support with a stop-loss just below it superior to chasing a stock that has already rallied 10%?",
  },

  // Level 3 - Predict Move
  {
    id: "lvl3-m2-predict-blind-move",
    level: 3,
    moduleIndex: 2,
    title: "Predict the Next Move: Blind Candle Simulation",
    category: "TECHNICAL",
    estimatedMinutes: 15,
    summary: "Analyze a chart cut off at a critical breakout moment, commit your prediction and risk/reward, then reveal future candles.",
    learningObjectives: [
      "Formulate a directional thesis under incomplete information",
      "Set realistic profit targets and stop-loss levels",
      "Experience the emotional discipline of committing before the outcome is known",
    ],
    hook: {
      title: "The JKH Consolidation Triangle",
      scenario: "JKH has consolidated between 205 and 215 for 4 weeks. Volume is drying up. What happens when it breaks 215?",
    },
    explore: {
      instruction: "Examine the chart up to the cutoff date. Pick your direction (Long/Wait), set your target and stop, and hit Reveal.",
      activityType: "PREDICT_NEXT_MOVE",
      initialConfig: {
        symbol: "JKH.N0000",
        cutoffIndex: 65,
        totalCandles: 100,
        correctDirection: "BULLISH",
        targetPrice: 228.0,
        stopPrice: 209.0,
      },
    },
    explain: {
      concept: "In live trading, you never see the right side of the chart. Successful trading is not about predicting the future with certainty; it is about taking high-probability asymmetric bets with controlled risk.",
      keyPoints: [
        "Never trade without a pre-defined stop-loss",
        "Your reward target should be at least 2x to 3x your stop-loss distance",
        "If a setup is ambiguous, the most profitable decision is to do nothing (cash is a position)",
      ],
      sriLankanContext: "When large foreign funds or local institutions accumulate shares on CSE, daily volume contracts before a multi-week upward markup.",
      tutorPromptSuggestion: "What should I do if a breakout immediately fails and falls back below the breakout level?",
    },
    applyTask: {
      prompt: "Commit a Long entry on the breakout candle with at least 2.5:1 Risk-to-Reward ratio.",
      scoringKey: "PREDICT_MOVE_RR",
      solutionCriteria: {
        minRR: 2.2,
        direction: "LONG",
      },
      hints: [
        "Place your stop loss below the recent consolidation low (209.00).",
      ],
    },
    reflectPrompt: "How did it feel when the future candles revealed? Did you focus on the outcome or the quality of your risk/reward process?",
  },

  // Level 4
  {
    id: "lvl4-m1-financial-statements",
    level: 4,
    moduleIndex: 1,
    title: "Fundamental Workbench: P/E, P/B, ROE & Debt Ratios",
    category: "FUNDAMENTAL",
    estimatedMinutes: 20,
    summary: "Compare side-by-side financials of CSE companies, calculate key valuation multiples, and spot hidden red flags.",
    learningObjectives: [
      "Calculate and interpret Price to Earnings (P/E) and Price to Book (P/B)",
      "Evaluate Return on Equity (ROE) as the engine of shareholder value creation",
      "Analyze Debt to Equity and interest cover ratios to assess insolvency risk",
    ],
    hook: {
      title: "Two Banks, Drastically Different Valuations",
      scenario: "Commercial Bank trades at 5.2x P/E with 15% ROE. Another financial trades at 14x P/E with 6% ROE. Which is creating genuine shareholder value?",
    },
    explore: {
      instruction: "Select companies from different sectors on the workbench to inspect 5-year ratio trends and compare them against sector medians.",
      activityType: "FUNDAMENTAL_WORKBENCH",
      initialConfig: {
        companyA: "COMB.N0000",
        companyB: "LOLC.N0000",
        sector: "BNK",
      },
    },
    explain: {
      concept: "Stock prices fluctuate on sentiment, but long-term value tracks corporate earnings power and returns on invested capital. Buying high-ROE businesses at low P/E multiples creates the margin of safety.",
      keyPoints: [
        "P/E < 8x on CSE often signals deep value or temporary cyclical distress",
        "P/B < 1.0x means you are buying the company for less than the net book value of its balance sheet assets",
        "ROE > 15% means the company generates healthy returns on shareholder equity without relying purely on excessive leverage",
      ],
      sriLankanContext: "Sri Lankan commercial banks consistently trade at single-digit P/E ratios (4x-6x) and below book value (0.6x-0.8x P/B) due to macroeconomic risk perceptions, offering substantial dividend yields (6%-8%).",
      tutorPromptSuggestion: "Can a stock with a very low P/E ratio actually be a dangerous value trap?",
    },
    applyTask: {
      prompt: "Identify the company with the highest sustainable ROE and lowest Debt/Equity ratio among the selected CSE industrial exporters.",
      scoringKey: "FUNDAMENTAL_STOCK_SELECTION",
      solutionCriteria: {
        selectedSymbol: "HAYL.N0000",
        minRoe: 14.0,
      },
      hints: [
        "Look for companies that generate foreign exchange revenue with solid asset turnover.",
      ],
    },
    reflectPrompt: "Why is high ROE without excessive debt the ultimate compounding engine for long-term equity investors?",
  },

  // Level 5
  {
    id: "lvl5-m1-indicator-playground",
    level: 5,
    moduleIndex: 1,
    title: "Indicator Playground: MA, RSI, MACD & Bollinger Bands",
    category: "TECHNICAL",
    estimatedMinutes: 20,
    summary: "Manipulate moving average lengths, RSI periods, and MACD settings on live CSE price action and run instant backtests to discover indicator lag.",
    learningObjectives: [
      "Understand how 50-day and 200-day Moving Averages act as trend filters",
      "Identify RSI overbought (>70) and oversold (<30) momentum divergences",
      "Understand why indicators lag price action and cannot predict market turns alone",
    ],
    hook: {
      title: "The Golden Cross on ASPI",
      scenario: "When the 50-day moving average crossed above the 200-day moving average on ASPI, the market had already rallied 18%. Explore indicator lag.",
    },
    explore: {
      instruction: "Move the sliders for MA lengths, RSI oversold thresholds, and MACD signal lines. Watch signals trigger and check the backtest win rate.",
      activityType: "INDICATOR_PLAYGROUND",
      initialConfig: {
        symbol: "JKH.N0000",
        maFast: 20,
        maSlow: 50,
        rsiPeriod: 14,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
      },
    },
    explain: {
      concept: "All technical indicators are mathematical derivatives of past price and volume. They do not contain secret forward-looking information. Use indicators as objective trend filters and confirmation tools, never as standalone crystal balls.",
      keyPoints: [
        "Moving Averages smooth noise but always lag behind price turns",
        "RSI divergence (price makes lower low, RSI makes higher low) indicates exhausting selling momentum",
        "Never buy simply because RSI is below 30; in strong downtrends, RSI can stay oversold for months",
      ],
      sriLankanContext: "On low-liquidity CSE counters, indicators frequently produce false whipsaws. Always pair indicators with volume confirmation and major horizontal support levels.",
      tutorPromptSuggestion: "Why do simple price action and volume usually give faster signals than lagging MACD crossovers?",
    },
    applyTask: {
      prompt: "Configure a 20/50 Moving Average crossover system on JKH that achieves at least 60% win rate with maximum 3 false signals over the last 120 trading days.",
      scoringKey: "MA_INDICATOR_TUNING",
      solutionCriteria: {
        minWinRate: 55,
        maxFalseSignals: 4,
      },
      hints: [
        "A 20-day EMA reacts faster than a simple SMA in trending phases.",
      ],
    },
    reflectPrompt: "If every indicator is derived from past price and volume, why do many beginners rely solely on indicators rather than studying price action?",
  },

  // Level 6
  {
    id: "lvl6-m1-position-sizing-ruin",
    level: 6,
    moduleIndex: 1,
    title: "Position Sizing Math & Risk of Ruin Simulator",
    category: "RISK",
    estimatedMinutes: 20,
    summary: "Drag stop-loss levels on a live chart to watch LKR risk, share count, and probability of ruin compute dynamically.",
    learningObjectives: [
      "Master the 1%-2% Account Risk Rule",
      "Calculate exact share count from entry price, stop-loss price, and LKR risk budget",
      "Run Monte Carlo simulations demonstrating how poor sizing guarantees account ruin",
    ],
    hook: {
      title: "Why a 50% Loss Requires a 100% Gain to Break Even",
      scenario: "If your LKR 1,000,000 account drops to 500,000, you need a 100% gain just to return to where you started. Protect capital above all else.",
    },
    explore: {
      instruction: "Drag the stop-loss line on the chart and adjust account risk % to watch your position size in LKR and maximum shares calculate in real time.",
      activityType: "POSITION_SIZING",
      initialConfig: {
        accountEquity: 1000000,
        riskPercent: 2.0,
        stockPrice: 218.50,
        stopPrice: 205.00,
      },
    },
    explain: {
      concept: "Position sizing is the single most important mathematical determinant of long-term trading survival. Amateur traders ask 'How much can I make?'; professional traders ask 'How much can I lose if this trade goes wrong?'",
      keyPoints: [
        "Risk Budget = Account Equity * Risk % (e.g. 1M * 2% = 20,000 LKR max loss)",
        "Risk Per Share = Entry Price - Stop Loss Price (e.g. 218.50 - 205.00 = 13.50 LKR)",
        "Position Shares = Risk Budget / Risk Per Share (e.g. 20,000 / 13.50 = 1,481 shares)",
        "Never size positions based on greed; size positions strictly based on your stop-loss distance",
      ],
      sriLankanContext: "Many CSE retail investors put 100% of their money into a single speculative penny stock. When the stock drops 40%, their trading capital is permanently crippled.",
      tutorPromptSuggestion: "How do I calculate my position size if I only want to risk LKR 15,000 on a trade?",
    },
    applyTask: {
      prompt: "Given a LKR 1,000,000 portfolio and a 1.5% max account risk rule, calculate the exact number of shares of SAMP to buy at LKR 94.80 with a stop-loss at LKR 89.80.",
      scoringKey: "POSITION_SIZING_CALCULATION",
      solutionCriteria: {
        exactShares: 3000,
        tolerance: 25,
      },
      hints: [
        "Max risk budget = 1,000,000 * 0.015 = 15,000 LKR.",
        "Risk per share = 94.80 - 89.80 = 5.00 LKR.",
        "Shares = 15,000 / 5.00 = 3,000 shares.",
      ],
    },
    reflectPrompt: "Why does adhering strictly to the 2% risk rule make it mathematically impossible for a string of 10 consecutive losses to destroy your account?",
  }
];

export function getLessonById(id: string): LessonSpec | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getLessonsByLevel(level: number): LessonSpec[] {
  return ALL_LESSONS.filter((l) => l.level === level);
}
