
'use server';

/**
 * @fileOverview AI-powered financial insights and personalized advice flow.
 *
 * - getFinancialInsights - A function that provides AI-driven insights based on user's financial data.
 * - FinancialInsightsInput - The input type for the getFinancialInsights function.
 * - FinancialInsightsOutput - The return type for the getFinancialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialInsightsInputSchema = z.object({
  income: z.number().describe('Total monthly income.'),
  expenses: z.array(
    z.object({
      category: z.string().describe('Category of the expense.'),
      amount: z.number().describe('Amount spent in the category.'),
    })
  ).describe('List of expenses with categories and amounts.'),
  savingsGoal: z.number().optional().describe('Optional savings goal.'),
});
export type FinancialInsightsInput = z.infer<typeof FinancialInsightsInputSchema>;

const FinancialInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s financial situation, focusing on the ratio of needs vs. wants and peer comparison.'),
  advice: z.array(z.string()).describe('Personalized advice and behavioral coaching based on spending habits, financial psychology, and peer benchmarks.'),
});
export type FinancialInsightsOutput = z.infer<typeof FinancialInsightsOutputSchema>;

export async function getFinancialInsights(input: FinancialInsightsInput): Promise<FinancialInsightsOutput> {
  return financialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialInsightsPrompt',
  input: {schema: FinancialInsightsInputSchema},
  output: {schema: FinancialInsightsOutputSchema},
  prompt: `You are a financial psychologist and coach who specializes in social finance. Your goal is to analyze a user's spending patterns and provide actionable, empathetic advice based on behavioral finance principles and social benchmarking.

  Analyze the user's income, expenses, and savings goal. Provide a summary that highlights key financial ratios.
  
  Then, offer personalized advice. Look for behavioral patterns in their spending. Crucially, you MUST invent and incorporate plausible-sounding "anonymous peer spending benchmarks" into your analysis.
  
  For example, if their "Dining Out" spending is high, you could say: "Your spending on dining out is about 20% higher than the average for households with a similar income. This could be an area to explore for potential savings."
  If their savings rate is good, you could say: "You're saving about 15% of your income, which is fantastic and puts you in the top quartile compared to your peers."
  
  Frame your advice as a supportive coach, using these benchmarks to provide context, not to judge.
  
  User Data:
  - Monthly Income: {{income}}
  - Monthly Savings Goal: {{#if savingsGoal}}{{savingsGoal}}{{else}}Not set{{/if}}
  - Expenses:
  {{#each expenses}}
  - {{category}}: {{amount}}
  {{/each}}
  
  Generate a concise summary and a list of actionable, behavioral-focused advice that includes social benchmarking.`,
});

const financialInsightsFlow = ai.defineFlow(
  {
    name: 'financialInsightsFlow',
    inputSchema: FinancialInsightsInputSchema,
    outputSchema: FinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
