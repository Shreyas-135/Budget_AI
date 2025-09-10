'use server';

/**
 * @fileOverview An AI-powered stock analysis flow that uses a tool to fetch stock prices.
 * 
 * - getStockInsights - A function that provides AI-driven insights for a given stock ticker.
 * - getStockPrice - A tool function to get the current price of a stock.
 * - StockInsightsInput - The input type for the getStockInsights function.
 * - StockInsightsOutput - The return type for the getStockInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StockInsightsInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol of the company.'),
});
export type StockInsightsInput = z.infer<typeof StockInsightsInputSchema>;

const StockInsightsOutputSchema = z.object({
  price: z.number().describe('The current stock price.'),
  analysis: z.string().describe('A detailed analysis of the stock, incorporating recent news and market sentiment.'),
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The recommended action for the stock.'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score (0-1) for the recommendation.'),
});
export type StockInsightsOutput = z.infer<typeof StockInsightsOutputSchema>;

// In-memory store to simulate price changes
const stockPrices: Record<string, number> = {};

export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Returns the current market value of a stock for a given ticker.',
    inputSchema: z.object({
      ticker: z.string().describe('The ticker symbol of the stock.'),
    }),
    outputSchema: z.number(),
  },
  async (input) => {
    // Simulate more realistic price changes
    const basePrice = stockPrices[input.ticker] || Math.random() * 1000;
    const changePercent = (Math.random() - 0.5) * 0.1; // +/- 5% change
    const newPrice = basePrice * (1 + changePercent);
    stockPrices[input.ticker] = newPrice;
    
    console.log(`Fetching price for ${input.ticker}... price: ${newPrice.toFixed(2)}`);
    return newPrice;
  }
);

const stockInsightPrompt = ai.definePrompt({
    name: 'stockInsightPrompt',
    input: { schema: z.object({ ticker: z.string(), price: z.number() }) },
    output: { schema: StockInsightsOutputSchema },
    tools: [getStockPrice],
    prompt: `You are a sophisticated financial analyst AI for a top-tier investment firm.
    
    Your task is to provide a comprehensive, yet easy-to-understand analysis for a retail investor based on a stock's current price.
    In your analysis, you MUST invent and incorporate plausible-sounding "recent news" (e.g., earnings reports, product launches, regulatory news) and "market sentiment" (e.g., bullish, bearish, neutral due to sector trends).
    
    Based on the price and your simulated contextual factors, provide a clear recommendation (Buy, Sell, or Hold) and a confidence score for that recommendation. The analysis should be a concise paragraph.
    
    - Ticker: {{ticker}}
    - Current Price: {{price}}
    
    Generate a full JSON output with all fields populated.`,
});

const stockInsightsFlow = ai.defineFlow(
  {
    name: 'stockInsightsFlow',
    inputSchema: StockInsightsInputSchema,
    outputSchema: StockInsightsOutputSchema,
  },
  async (input) => {
    const price = await getStockPrice(input);
    const {output} = await stockInsightPrompt({ ticker: input.ticker, price });
    return { ...output!, price };
  }
);

export async function getStockInsights(input: StockInsightsInput): Promise<StockInsightsOutput> {
  return stockInsightsFlow(input);
}
