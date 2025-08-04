/**
 * Risk calculation utilities using historical data
 */

export interface RiskMetrics {
  var95: number;
  var99: number;
  expectedShortfall95: number;
  expectedShortfall99: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

export interface TimeSeriesData {
  date: string;
  portfolioValue: number;
  returns: number;
  cumulativeReturns: number;
}

/**
 * Calculate Value at Risk using historical simulation method
 * @param returns Array of historical returns
 * @param confidenceLevel Confidence level (e.g., 0.95 for 95%)
 * @param portfolioValue Current portfolio value
 * @param timeHorizon Time horizon in days
 */
export function calculateVaR(
  returns: number[], 
  confidenceLevel: number, 
  portfolioValue: number,
  timeHorizon: number = 1
): number {
  if (returns.length === 0) return 0;
  
  // Sort returns in ascending order (worst first)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  // Scale returns by time horizon (square root of time rule)
  const scaledReturns = sortedReturns.map(r => r * Math.sqrt(timeHorizon));
  
  // Find the percentile corresponding to (1 - confidence level)
  const percentileIndex = Math.floor((1 - confidenceLevel) * scaledReturns.length);
  const varReturn = scaledReturns[percentileIndex] || scaledReturns[0];
  
  // Convert to monetary loss (negative return means loss)
  return Math.abs(varReturn * portfolioValue);
}

/**
 * Calculate Expected Shortfall (Conditional VaR)
 * @param returns Array of historical returns
 * @param confidenceLevel Confidence level (e.g., 0.95 for 95%)
 * @param portfolioValue Current portfolio value
 * @param timeHorizon Time horizon in days
 */
export function calculateExpectedShortfall(
  returns: number[], 
  confidenceLevel: number, 
  portfolioValue: number,
  timeHorizon: number = 1
): number {
  if (returns.length === 0) return 0;
  
  // Sort returns in ascending order (worst first)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  // Scale returns by time horizon
  const scaledReturns = sortedReturns.map(r => r * Math.sqrt(timeHorizon));
  
  // Find the cutoff point for the tail
  const cutoffIndex = Math.floor((1 - confidenceLevel) * scaledReturns.length);
  
  // Calculate average of returns in the tail (worst scenarios)
  const tailReturns = scaledReturns.slice(0, cutoffIndex + 1);
  const averageTailReturn = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
  
  // Convert to monetary loss
  return Math.abs(averageTailReturn * portfolioValue);
}

/**
 * Calculate portfolio beta relative to market
 * @param portfolioReturns Array of portfolio returns
 * @param marketReturns Array of market returns (same period)
 */
export function calculateBeta(portfolioReturns: number[], marketReturns: number[]): number {
  if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length === 0) {
    return 1.0; // Default beta if no market data
  }
  
  // Calculate covariance and market variance
  const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
  const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < portfolioReturns.length; i++) {
    const portfolioDiff = portfolioReturns[i] - portfolioMean;
    const marketDiff = marketReturns[i] - marketMean;
    
    covariance += portfolioDiff * marketDiff;
    marketVariance += marketDiff * marketDiff;
  }
  
  covariance /= portfolioReturns.length - 1;
  marketVariance /= marketReturns.length - 1;
  
  return marketVariance === 0 ? 1.0 : covariance / marketVariance;
}

/**
 * Calculate Sharpe Ratio
 * @param returns Array of returns
 * @param riskFreeRate Risk-free rate (annualized)
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;
  
  // Calculate annualized return and volatility
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = (1 + meanReturn) ** 252 - 1; // Assuming daily returns
  
  const variance = returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (returns.length - 1);
  const annualizedVolatility = Math.sqrt(variance * 252);
  
  return annualizedVolatility === 0 ? 0 : (annualizedReturn - riskFreeRate) / annualizedVolatility;
}

/**
 * Calculate Maximum Drawdown
 * @param cumulativeReturns Array of cumulative returns
 */
export function calculateMaxDrawdown(cumulativeReturns: number[]): number {
  if (cumulativeReturns.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = cumulativeReturns[0];
  
  for (let i = 1; i < cumulativeReturns.length; i++) {
    const current = cumulativeReturns[i];
    
    if (current > peak) {
      peak = current;
    } else {
      const drawdown = (peak - current) / (1 + peak);
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown;
}

/**
 * Calculate portfolio volatility (annualized)
 * @param returns Array of daily returns
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (returns.length - 1);
  
  // Annualize volatility (assuming daily returns)
  return Math.sqrt(variance * 252);
}

/**
 * Perform stress tests on portfolio
 * @param portfolioValue Current portfolio value
 * @param returns Historical returns for correlation analysis
 */
export function performStressTesting(portfolioValue: number, returns: number[]) {
  // Historical crisis scenarios
  const stressScenarios = [
    {
      name: "Krach 2008 (Lehman Brothers)",
      description: "Scenariusz kryzysu finansowego 2008",
      marketDrop: -0.37, // 37% drop
      duration: 252, // days
      volatilityMultiplier: 2.5
    },
    {
      name: "COVID-19 Marzec 2020",
      description: "Gwałtowny spadek rynków w marcu 2020",
      marketDrop: -0.34, // 34% drop
      duration: 30, // days
      volatilityMultiplier: 3.0
    },
    {
      name: "Korekta rynkowa -20%",
      description: "Typowa korekta rynkowa",
      marketDrop: -0.20, // 20% drop
      duration: 60, // days
      volatilityMultiplier: 1.8
    },
    {
      name: "Nagły szok rynkowy",
      description: "Jednorazowy szok (-10% w ciągu dnia)",
      marketDrop: -0.10, // 10% drop
      duration: 1, // day
      volatilityMultiplier: 5.0
    }
  ];
  
  return stressScenarios.map(scenario => ({
    ...scenario,
    estimatedLoss: Math.abs(portfolioValue * scenario.marketDrop),
    estimatedLossPct: Math.abs(scenario.marketDrop * 100)
  }));
}

/**
 * Create histogram data for P&L distribution
 * @param returns Array of historical returns
 * @param binCount Number of histogram bins
 */
export function createPLHistogram(returns: number[], binCount: number = 25) {
  if (returns.length === 0) return [];
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const minReturn = sortedReturns[0];
  const maxReturn = sortedReturns[sortedReturns.length - 1];
  const binWidth = (maxReturn - minReturn) / binCount;
  
  return Array.from({ length: binCount }, (_, i) => {
    const binStart = minReturn + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = sortedReturns.filter(r => r >= binStart && r < binEnd).length;
    
    return {
      binStart: binStart * 100, // Convert to percentage
      binEnd: binEnd * 100,
      binCenter: (binStart + binWidth / 2) * 100,
      count,
      frequency: (count / returns.length) * 100 // Percentage frequency
    };
  });
}