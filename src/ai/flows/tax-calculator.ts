'use server';

/**
 * @fileOverview An AI-powered tax calculation flow.
 *
 * - getTaxCalculation - A function that provides an estimated tax calculation based on income and filing status.
 * - TaxCalculatorInput - The input type for the getTaxCalculation function.
 * - TaxCalculatorOutput - The return type for the getTaxCalculation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaxCalculatorInputSchema = z.object({
  income: z.number().describe('The total annual income.'),
  filingStatus: z.enum(['single', 'married_jointly', 'married_separately', 'head_of_household']).describe('The tax filing status.'),
});
export type TaxCalculatorInput = z.infer<typeof TaxCalculatorInputSchema>;

const TaxCalculatorOutputSchema = z.object({
  estimatedTax: z.number().describe('The estimated total tax liability.'),
  breakdown: z.array(z.object({
    bracket: z.string().describe('The tax bracket (e.g., "10%", "12%").'),
    taxableAmount: z.number().describe('The amount of income taxed at this bracket.'),
    taxPaid: z.number().describe('The tax paid for this bracket.'),
  })).describe('A breakdown of taxes paid per tax bracket.'),
  effectiveRate: z.number().describe('The effective tax rate as a percentage.'),
});
export type TaxCalculatorOutput = z.infer<typeof TaxCalculatorOutputSchema>;


export async function getTaxCalculation(input: TaxCalculatorInput): Promise<TaxCalculatorOutput> {
  return taxCalculatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taxCalculatorPrompt',
  input: { schema: TaxCalculatorInputSchema },
  output: { schema: TaxCalculatorOutputSchema },
  prompt: `You are a tax assistant. Based on the user's income and filing status, calculate the estimated federal income tax for the current year.

  Use the following US tax brackets for your calculation. Be precise.
  
  Income: {{income}}
  Filing Status: {{filingStatus}}
  
  Provide the estimated total tax, a breakdown of how much tax is paid in each bracket, and the effective tax rate.`,
});

const taxCalculatorFlow = ai.defineFlow(
  {
    name: 'taxCalculatorFlow',
    inputSchema: TaxCalculatorInputSchema,
    outputSchema: TaxCalculatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
