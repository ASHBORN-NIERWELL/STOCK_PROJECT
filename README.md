# 🇱🇰 CSE Mastery — Colombo Stock Exchange Trader Simulator & AI Mentor

**CSE Mastery** is a serverless, high-fidelity web application built for the **Colombo Stock Exchange (CSE), Sri Lanka**. It guides an absolute beginner to a skilled, disciplined stock trader through live and historical market data, interactive learning labs, a realistic ledger-based mock trading account, and an unvarnished AI coach.

---

## ⚖️ Educational Notice
> **EDUCATIONAL USE ONLY — NOT FINANCIAL ADVICE**  
> CSE Mastery is an educational simulation. All trading, portfolio balances, and transaction histories occur strictly in virtual LKR currency. Never risk real money based on simulated exercises.

---

## 🚀 Key Features

1. **Live & Resilient CSE Market Data Layer**:
   - Direct integration with Colombo Stock Exchange (CSE) unofficial JSON market feeds (`/api/tradeSummary`, `/api/aspiData`, `/api/marketIndices`, `/api/marketStatus`).
   - Circuit breaker with automatic fallback to rich historical demo data when upstream servers are unreachable or during market closures.
   - Single-flight mutex locking to ensure 100 concurrent users trigger only 1 upstream request.
   - Clear data freshness badges: `LIVE`, `DELAYED`, `CACHED`, and `DEMO`.
   - Real macroeconomic indicators (CBSL SDFR policy rates, USD/LKR indicative rate, 12M T-Bills risk-free benchmark, CCPI inflation).

2. **Serverless Ledger-Based Mock Trading Engine**:
   - Initial virtual balance of **LKR 1,000,000**.
   - Exact Sri Lankan equity cost breakdown: **1.120% per leg** (Brokerage 0.640% with LKR 25 min, SEC Cess 0.072%, CSE Fee 0.084%, CDS Fee 0.024%, Share Transaction Levy 0.300%).
   - T+2 settlement cycle simulation.
   - On-read deterministic evaluation of pending orders (Limit & Stop-Loss) against high/low price history.
   - Mandatory Pre-Trade Journal & **Devil's Advocate AI Challenge** before confirming any trade.

3. **10-Level Progressive Curriculum & Interactive Labs**:
   - **Level 0**: Money Basics & 12M T-Bill Benchmark (9.85%)
   - **Level 1**: What a Stock Market is & CSE Order Book Spreads
   - **Level 2**: CSE Market Mechanics, 1.12% Fees & T+2 Settlement
   - **Level 3**: Price Action, Support/Resistance & Blind Candle Replays
   - **Level 4**: Fundamental Workbench (P/E, P/B, ROE, Debt Ratios)
   - **Level 5**: Indicator Playground (MA crossovers, RSI divergence, MACD lag)
   - **Level 6**: Risk Management & 2% Position Sizing Math
   - **Level 7**: Strategies (Value, High Dividend Yield, Momentum Breakouts)
   - **Level 8**: Trading Psychology & Bias Detection
   - **Level 9**: Macro Cycles, USD/LKR & Sovereign Debt Crisis Navigation
   - **Level 10**: Mastery Capstone & Written Thesis Defense
   - Pure TypeScript scoring engine with server-side tamper verification.

4. **The Brutal Truth Report**:
   - Statistical performance audit from the ledger: Win Rate, Profit Factor, Expectancy, Sharpe Ratio, Max Drawdown.
   - Benchmark comparison against the CSE ASPI Index, S&P SL20, and 12-Month Treasury Bills.
   - Cost drag calculation ("You paid LKR X to the market in friction").
   - Discipline score and mistake auto-tagging (`HELD_PAST_STOP`, `OVERSIZED_POSITION`, `REVENGE_TRADING`).
   - Brutal Coach AI verdict with a toggle between "Brutal" and "Firm but Gentle" tone.

5. **Daily Learning Engine**:
   - 6-step personalized daily session: Market Pulse Brief, Today's Interactive Lab, Live Case of the Day, Concept of the Day, Spaced Repetition Review, and Mock Account Check-in.

---

## 🏗️ Architecture & Vercel Constraints

- **Framework**: Next.js 14 (App Router), React Server Components, TypeScript.
- **Charts**: TradingView Lightweight Charts (financial candlestick charts) & Recharts (Radar, Calibration, and Fan charts).
- **Database**: Serverless PostgreSQL (Neon via Vercel Marketplace) with Drizzle ORM.
- **Zero-Setup Parity**: Includes built-in in-memory data store with complete seed history (`USE_DEMO_DATA=true`).
- **AI SDK**: Vercel AI SDK supporting Google Gemini (default free tier), Groq, OpenRouter, and offline curriculum templates.

### Vercel Constraint Design:
- **Serverless Lifespan**: Ephemeral filesystem compliance — all state is kept in PostgreSQL / Memory Store and Vercel Blob.
- **Cron Limits**: Designed for Vercel Hobby limits (one run per day in UTC at 10:00 UTC / 15:30 SLST after CSE market close).
- **Region Placement**: Recommended region `sin1` (Singapore) or `bom1` (Mumbai) for minimum latency to Sri Lanka.

---

## 📦 Deployment Guide (5 Steps to Vercel)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy CSE Mastery"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and select your repository.
3. **Add Neon Database & Upstash Redis (Optional)**:
   - In the Vercel Project Dashboard, go to **Storage** and add **Neon Serverless Postgres** and **Upstash Redis**.
4. **Configure Environment Variables**:
   - `CRON_SECRET`: Random secure string (e.g. `cse_cron_secret_2026`).
   - `GEMINI_API_KEY`: Your Google AI Studio API key (free tier).
   - `DATABASE_URL`: Automatically populated by Neon integration.
   - `USE_DEMO_DATA`: Set to `"false"` (or `"true"` for zero-database mode).
   - `CSE_PROVIDER`: `"CSE_LIVE"`.
5. **Deploy & Seed**:
   - Click **Deploy**. Run `npm run db:seed` via Vercel CLI or migration script if using Neon.

---

## 🛠️ Local Development

```bash
# Clone the repository
cd "STOCK PROJECT"

# Install dependencies
npm install

# Run zero-setup local dev server
npm run dev

# Run automated unit tests
npm run test
```

Open [http://localhost:3000](http://localhost:3000) to start trading!

---

## 🔒 Security & Data Privacy

- User isolation: All ledger, progress, and portfolio operations are strictly scoped to the authenticated `user_id`.
- Protected Jobs: All `/api/jobs/*` routes require `Authorization: Bearer <CRON_SECRET>`.
- Zero key leakage: API keys and database credentials are kept in server environment variables and never sent to the browser.
