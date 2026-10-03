import { calculateCSEFees, roundToCSETick, CSEFeeBreakdown } from "@/lib/cse/fee-calculator";
import { memoryStore, OrderEntity, LedgerEntryEntity, PortfolioEntity, TradeJournalEntity } from "@/db/memory-store";
import { cseProvider } from "@/lib/cse/provider";

export interface Position {
  symbol: string;
  name: string;
  shares: number;
  averageCost: number;
  totalCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  totalFeesPaid: number;
  portfolioWeightPercent: number;
}

export interface PortfolioSummary {
  portfolioId: string;
  userId: string;
  mode: "LIVE_MOCK" | "REPLAY";
  cash: number;
  settledCash: number;
  stockValue: number;
  totalEquity: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalFeesPaid: number;
  totalReturnLKR: number;
  totalReturnPercent: number;
  initialCash: number;
  resetCount: number;
  positions: Position[];
  pendingOrders: OrderEntity[];
  recentLedger: LedgerEntryEntity[];
}

export interface TradeOrderRequest {
  userId: string;
  portfolioId?: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP_LOSS" | "TAKE_PROFIT";
  shares: number;
  limitPrice?: number;
  stopPrice?: number;
  thesis: string;
  entryReason: string;
  targetPrice?: number;
  stopLossPrice?: number;
  confidenceLevel: number;
  devilsAdvocateAcknowledged?: boolean;
}

export interface TradeExecutionResult {
  success: boolean;
  orderId?: string;
  status: "FILLED" | "PENDING" | "REJECTED";
  message: string;
  fees?: CSEFeeBreakdown;
  executedPrice?: number;
  executedShares?: number;
  totalCostLKR?: number;
  remainingCash?: number;
}

export class TradingEngine {
  private static instance: TradingEngine;

  public static getInstance(): TradingEngine {
    if (!TradingEngine.instance) {
      TradingEngine.instance = new TradingEngine();
    }
    return TradingEngine.instance;
  }

  /**
   * Evaluates pending orders against current market prices on-read (Serverless-safe determinism)
   */
  public async evaluatePendingOrders(userId: string): Promise<void> {
    const portfolio = memoryStore.getPortfolioByUserId(userId);
    const pendingOrders = memoryStore.getPendingOrders(userId);
    if (pendingOrders.length === 0) return;

    for (const order of pendingOrders) {
      const quote = await cseProvider.getStockQuote(order.symbol);
      if (!quote) continue;

      let shouldFill = false;
      let fillPrice = quote.price;

      if (order.side === "BUY") {
        if (order.type === "LIMIT" && order.limitPrice && quote.low <= order.limitPrice) {
          shouldFill = true;
          fillPrice = Math.min(order.limitPrice, quote.price);
        }
      } else if (order.side === "SELL") {
        if (order.type === "LIMIT" && order.limitPrice && quote.high >= order.limitPrice) {
          shouldFill = true;
          fillPrice = Math.max(order.limitPrice, quote.price);
        } else if (order.type === "STOP_LOSS" && order.stopPrice && quote.low <= order.stopPrice) {
          shouldFill = true;
          fillPrice = Math.min(order.stopPrice, quote.price);
        } else if (order.type === "TAKE_PROFIT" && order.limitPrice && quote.high >= order.limitPrice) {
          shouldFill = true;
          fillPrice = Math.max(order.limitPrice, quote.price);
        }
      }

      if (shouldFill) {
        await this.executeFill(order, fillPrice, portfolio);
      }
    }
  }

  /**
   * Places a trade with mandatory journal and fee deduction
   */
  public async placeOrder(req: TradeOrderRequest): Promise<TradeExecutionResult> {
    const user = memoryStore.getUser(req.userId);
    if (!user) {
      return { success: false, status: "REJECTED", message: "User not found." };
    }

    const portfolio = memoryStore.getPortfolioByUserId(req.userId);
    const quote = await cseProvider.getStockQuote(req.symbol);
    if (!quote) {
      return { success: false, status: "REJECTED", message: `Symbol ${req.symbol} is not recognized on the CSE.` };
    }

    if (req.shares <= 0 || !Number.isInteger(req.shares)) {
      return { success: false, status: "REJECTED", message: "Order shares must be a positive whole integer." };
    }

    // Position sizing constraint for beginner levels (Level 0 - 2: max 20% of account in a single stock)
    const totalEquity = portfolio.cash + (await this.calculateHoldingsValue(portfolio.userId));
    const estimatedTradeValue = (req.limitPrice || quote.price) * req.shares;

    if (user.masteryLevel <= 2 && req.side === "BUY") {
      const maxAllowed = totalEquity * 0.25; // 25% cap for beginners
      if (estimatedTradeValue > maxAllowed) {
        return {
          success: false,
          status: "REJECTED",
          message: `Discipline Rule: At Level ${user.masteryLevel}, risk limit allows maximum 25% (LKR ${Math.round(maxAllowed).toLocaleString()}) in a single stock to prevent catastrophic drawdown.`,
        };
      }
    }

    // Sell validation: must own sufficient shares
    if (req.side === "SELL") {
      const positions = await this.calculatePositions(portfolio.userId);
      const existing = positions.find((p) => p.symbol === req.symbol);
      if (!existing || existing.shares < req.shares) {
        return {
          success: false,
          status: "REJECTED",
          message: `Insufficient shares. You hold ${existing?.shares || 0} shares of ${req.symbol}, cannot sell ${req.shares}.`,
        };
      }
    }

    // Buy validation: must have sufficient cash including CSE fees
    if (req.side === "BUY" && req.type === "MARKET") {
      const fees = calculateCSEFees(quote.price * req.shares, "BUY");
      if (portfolio.cash < fees.netTradeAmount) {
        return {
          success: false,
          status: "REJECTED",
          message: `Insufficient virtual cash. Order requires ${fees.netTradeAmount.toLocaleString()} LKR (including ${fees.totalFees.toLocaleString()} LKR CSE fees), but available cash is ${portfolio.cash.toLocaleString()} LKR.`,
        };
      }
    }

    // Save Trade Journal
    const journalId = `journal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const journal: TradeJournalEntity = {
      id: journalId,
      userId: req.userId,
      symbol: req.symbol,
      side: req.side,
      thesis: req.thesis || "Technical momentum setup on daily chart.",
      entryReason: req.entryReason || "MOMENTUM",
      targetPrice: req.targetPrice,
      stopLossPrice: req.stopLossPrice,
      riskRewardRatio: req.targetPrice && req.stopLossPrice && req.side === "BUY"
        ? Math.abs(req.targetPrice - quote.price) / Math.max(0.01, Math.abs(quote.price - req.stopLossPrice))
        : 2.0,
      plannedRiskLKR: req.stopLossPrice ? Math.abs(quote.price - req.stopLossPrice) * req.shares : 0,
      expectedHoldingDays: 5,
      confidenceLevel: req.confidenceLevel || 3,
      checklistCompleted: true,
      devilsAdvocateCritique: "Beware of broader market volatility and illiquid order book slippage on sudden market pullbacks.",
      devilsAdvocateAcknowledged: req.devilsAdvocateAcknowledged ?? true,
      mistakeTags: [],
      createdAt: new Date().toISOString(),
    };
    memoryStore.upsertJournal(journal);

    // Create Order
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const order: OrderEntity = {
      id: orderId,
      userId: req.userId,
      portfolioId: portfolio.id,
      symbol: req.symbol,
      side: req.side,
      type: req.type,
      limitPrice: req.limitPrice,
      stopPrice: req.stopPrice,
      shares: req.shares,
      filledShares: 0,
      status: "PENDING",
      journalId,
      createdAt: new Date().toISOString(),
    };

    // Execute immediately if MARKET order
    if (req.type === "MARKET") {
      const fillResult = await this.executeFill(order, quote.price, portfolio);
      return fillResult;
    }

    // Otherwise save as pending order
    memoryStore.upsertOrder(order);
    return {
      success: true,
      orderId,
      status: "PENDING",
      message: `Pending ${req.type} order placed for ${req.shares} shares of ${req.symbol} at ${req.limitPrice || req.stopPrice} LKR.`,
    };
  }

  /**
   * Executes fill and writes immutable ledger entry
   */
  private async executeFill(order: OrderEntity, fillPrice: number, portfolio: PortfolioEntity): Promise<TradeExecutionResult> {
    const grossAmount = fillPrice * order.shares;
    const feeBreakdown = calculateCSEFees(grossAmount, order.side);
    const netCashChange = order.side === "BUY" ? -feeBreakdown.netTradeAmount : feeBreakdown.netTradeAmount;

    // Check cash on buy
    if (order.side === "BUY" && portfolio.cash < feeBreakdown.netTradeAmount) {
      order.status = "REJECTED";
      memoryStore.upsertOrder(order);
      return {
        success: false,
        status: "REJECTED",
        message: "Insufficient cash to execute fill at market price.",
      };
    }

    // Update portfolio cash
    portfolio.cash = Math.round((portfolio.cash + netCashChange) * 100) / 100;
    // T+2 settlement calculation
    const settlementDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    memoryStore.updatePortfolio(portfolio);

    // Record immutable ledger entry
    const ledgerId = `led-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ledgerEntry: LedgerEntryEntity = {
      id: ledgerId,
      userId: order.userId,
      portfolioId: portfolio.id,
      orderId: order.id,
      type: order.side === "BUY" ? "BUY_FILL" : "SELL_FILL",
      symbol: order.symbol,
      shares: order.shares,
      price: fillPrice,
      grossAmount,
      feeAmount: feeBreakdown.totalFees,
      netAmount: feeBreakdown.netTradeAmount,
      cashBalanceAfter: portfolio.cash,
      settlementDate,
      isSettled: false,
      idempotencyKey: `fill-${order.id}-${Date.now()}`,
      metadata: {
        feeBreakdown,
      },
      createdAt: new Date().toISOString(),
    };
    memoryStore.addLedgerEntry(ledgerEntry);

    // Update order status
    order.status = "FILLED";
    order.filledShares = order.shares;
    order.averageFillPrice = fillPrice;
    order.filledAt = new Date().toISOString();
    memoryStore.upsertOrder(order);

    return {
      success: true,
      orderId: order.id,
      status: "FILLED",
      message: `Executed ${order.side} for ${order.shares} ${order.symbol} @ ${fillPrice.toFixed(2)} LKR. Total Fees: ${feeBreakdown.totalFees.toFixed(2)} LKR.`,
      fees: feeBreakdown,
      executedPrice: fillPrice,
      executedShares: order.shares,
      totalCostLKR: feeBreakdown.netTradeAmount,
      remainingCash: portfolio.cash,
    };
  }

  /**
   * Computes exact positions from ledger history
   */
  public async calculatePositions(userId: string): Promise<Position[]> {
    const ledger = memoryStore.getLedgerByUserId(userId);
    const summary = await cseProvider.getMarketSummary();

    const positionMap = new Map<string, { shares: number; totalCost: number; realizedPnL: number; totalFees: number }>();

    // Process ledger chronologically (oldest to newest)
    const sortedLedger = [...ledger].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    for (const entry of sortedLedger) {
      if (!entry.symbol) continue;
      const sym = entry.symbol;
      const current = positionMap.get(sym) || { shares: 0, totalCost: 0, realizedPnL: 0, totalFees: 0 };
      current.totalFees += entry.feeAmount;

      if (entry.type === "BUY_FILL" && entry.shares && entry.price) {
        current.shares += entry.shares;
        current.totalCost += entry.netAmount; // price*shares + fees
      } else if (entry.type === "SELL_FILL" && entry.shares && entry.price) {
        if (current.shares > 0) {
          const avgCostPerShare = current.totalCost / current.shares;
          const costOfSharesSold = avgCostPerShare * entry.shares;
          const tradePnL = entry.netAmount - costOfSharesSold;
          current.realizedPnL += tradePnL;
          current.shares -= entry.shares;
          current.totalCost = Math.max(0, current.totalCost - costOfSharesSold);
        }
      }
      positionMap.set(sym, current);
    }

    const positions: Position[] = [];
    for (const [sym, data] of Array.from(positionMap.entries())) {
      if (data.shares <= 0) continue;

      const quote = summary.quotes.find((q) => q.symbol === sym) || (await cseProvider.getStockQuote(sym));
      const currentPrice = quote ? quote.price : 100;
      const marketValue = Math.round(currentPrice * data.shares * 100) / 100;
      const averageCost = Math.round((data.totalCost / data.shares) * 100) / 100;
      const unrealizedPnL = Math.round((marketValue - data.totalCost) * 100) / 100;
      const unrealizedPnLPercent = data.totalCost > 0 ? Math.round(((marketValue - data.totalCost) / data.totalCost) * 10000) / 100 : 0;

      positions.push({
        symbol: sym,
        name: quote?.name || sym,
        shares: data.shares,
        averageCost,
        totalCost: Math.round(data.totalCost * 100) / 100,
        currentPrice,
        marketValue,
        unrealizedPnL,
        unrealizedPnLPercent,
        realizedPnL: Math.round(data.realizedPnL * 100) / 100,
        totalFeesPaid: Math.round(data.totalFees * 100) / 100,
        portfolioWeightPercent: 0, // filled below
      });
    }

    // Compute portfolio weights
    const totalStockVal = positions.reduce((acc, p) => acc + p.marketValue, 0);
    if (totalStockVal > 0) {
      for (const p of positions) {
        p.portfolioWeightPercent = Math.round((p.marketValue / totalStockVal) * 10000) / 100;
      }
    }

    return positions;
  }

  private async calculateHoldingsValue(userId: string): Promise<number> {
    const positions = await this.calculatePositions(userId);
    return positions.reduce((acc, p) => acc + p.marketValue, 0);
  }

  /**
   * Computes complete Portfolio Summary
   */
  public async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    await this.evaluatePendingOrders(userId);

    const portfolio = memoryStore.getPortfolioByUserId(userId);
    const positions = await this.calculatePositions(userId);
    const pendingOrders = memoryStore.getPendingOrders(userId);
    const ledger = memoryStore.getLedgerByUserId(userId);
    const recentLedger = ledger.slice(0, 15);

    const stockValue = positions.reduce((acc, p) => acc + p.marketValue, 0);
    const totalEquity = Math.round((portfolio.cash + stockValue) * 100) / 100;
    const totalUnrealizedPnL = positions.reduce((acc, p) => acc + p.unrealizedPnL, 0);
    const totalRealizedPnL = positions.reduce((acc, p) => acc + p.realizedPnL, 0);
    const totalFeesPaid = Math.round(ledger.reduce((acc, e) => acc + (Number(e.feeAmount) || 0), 0) * 100) / 100;

    const initialCash = Number(portfolio.initialCash) || 1000000;
    const totalReturnLKR = Math.round((totalEquity - initialCash) * 100) / 100;
    const totalReturnPercent = Math.round(((totalEquity - initialCash) / initialCash) * 10000) / 100;

    return {
      portfolioId: portfolio.id,
      userId,
      mode: portfolio.mode,
      cash: portfolio.cash,
      settledCash: portfolio.settledCash,
      stockValue,
      totalEquity,
      totalRealizedPnL,
      totalUnrealizedPnL,
      totalFeesPaid,
      totalReturnLKR,
      totalReturnPercent,
      initialCash,
      resetCount: portfolio.resetCount,
      positions,
      pendingOrders,
      recentLedger,
    };
  }

  /**
   * Resets mock account (permanently logs reset event and increments reset count)
   */
  public resetAccount(userId: string): PortfolioSummary {
    const portfolio = memoryStore.getPortfolioByUserId(userId);
    portfolio.cash = 1000000;
    portfolio.settledCash = 1000000;
    portfolio.resetCount += 1;
    memoryStore.updatePortfolio(portfolio);

    // Record reset in ledger
    memoryStore.addLedgerEntry({
      id: `led-reset-${Date.now()}`,
      userId,
      portfolioId: portfolio.id,
      type: "RESET",
      grossAmount: 1000000,
      feeAmount: 0,
      netAmount: 1000000,
      cashBalanceAfter: 1000000,
      isSettled: true,
      idempotencyKey: `reset-${userId}-${portfolio.resetCount}-${Date.now()}`,
      metadata: { reason: "User requested account reset" },
      createdAt: new Date().toISOString(),
    });

    return {
      portfolioId: portfolio.id,
      userId,
      mode: portfolio.mode,
      cash: 1000000,
      settledCash: 1000000,
      stockValue: 0,
      totalEquity: 1000000,
      totalRealizedPnL: 0,
      totalUnrealizedPnL: 0,
      totalFeesPaid: 0,
      totalReturnLKR: 0,
      totalReturnPercent: 0,
      initialCash: 1000000,
      resetCount: portfolio.resetCount,
      positions: [],
      pendingOrders: [],
      recentLedger: [],
    };
  }
}

export const tradingEngine = TradingEngine.getInstance();
