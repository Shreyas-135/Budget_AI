'use server';

/**
 * @fileOverview An AI-powered debt payoff calculator that compares Avalanche and Snowball methods.
 *
 * - getDebtPayoffPlan - A function that returns debt payoff plans.
 * - DebtPayoffInput - The input type for the getDebtPayoffPlan function.
 * - DebtPayoffOutput - The return type for the getDebtPayoffPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DebtSchema = z.object({
  name: z.string().describe('The name of the debt (e.g., "Credit Card", "Student Loan").'),
  balance: z.number().describe('The current outstanding balance.'),
  apr: z.number().describe('The Annual Percentage Rate (APR) of the debt.'),
  minimumPayment: z.number().describe('The minimum monthly payment.'),
});

const DebtPayoffInputSchema = z.object({
  debts: z.array(DebtSchema).describe('A list of the user\'s current debts.'),
  extraPayment: z.number().optional().describe('An optional extra amount to pay each month across all debts.'),
});
export type DebtPayoffInput = z.infer<typeof DebtPayoffInputSchema>;

const PayoffStepSchema = z.object({
  month: z.number().describe('The month number of the payment.'),
  debtName: z.string().describe('The name of the debt the payment is applied to.'),
  paymentAmount: z.number().describe('The amount paid towards the debt.'),
  remainingBalance: z.number().describe('The remaining balance after the payment.'),
});

const PayoffPlanSchema = z.object({
  totalMonths: z.number().describe('The total number of months to become debt-free.'),
  totalInterestPaid: z.number().describe('The total amount of interest paid over the life of the debts.'),
  breakdown: z.array(PayoffStepSchema).describe('A month-by-month breakdown of payments for the first 12 months.'),
});

const DebtPayoffOutputSchema = z.object({
  avalanche: PayoffPlanSchema.describe('The payoff plan using the Avalanche method (paying highest APR first).'),
  snowball: PayoffPlanSchema.describe('The payoff plan using the Snowball method (paying lowest balance first).'),
});
export type DebtPayoffOutput = z.infer<typeof DebtPayoffOutputSchema>;

export async function getDebtPayoffPlan(input: DebtPayoffInput): Promise<DebtPayoffOutput> {
  return debtPayoffCalculatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'debtPayoffCalculatorPrompt',
  input: { schema: DebtPayoffInputSchema },
  output: { schema: DebtPayoffOutputSchema },
  prompt: `You are a financial advisor specializing in debt management.
  
  A user has provided their debt information and an optional extra monthly payment amount. Your task is to calculate two debt payoff plans: the Avalanche method and the Snowball method.
  
  - Avalanche Method: Prioritize paying off the debt with the highest APR first. All extra payment goes towards this debt. Once it's paid off, the payment from that debt plus the extra payment rolls over to the next highest APR debt.
  - Snowball Method: Prioritize paying off the debt with the smallest balance first. All extra payment goes towards this debt. Once it's paid off, the payment from that debt plus the extra payment rolls over to the next smallest balance debt.
  
  For both methods, you must:
  1. Calculate the total months it will take to be completely debt-free.
  2. Calculate the total interest paid across all debts for the entire payoff period.
  3. Provide a step-by-step breakdown of payments for the first 12 months only. Show which debt the payment is for, the amount, and the remaining balance for that debt.
  
  Ensure all calculations are precise. Monthly interest is calculated as (APR / 12 / 100) * balance.
  
  User Input:
  Debts:
  {{#each debts}}
  - Name: {{name}}, Balance: {{balance}}, APR: {{apr}}%, Min Payment: {{minimumPayment}}
  {{/each}}
  Extra Monthly Payment: {{#if extraPayment}}{{extraPayment}}{{else}}0{{/if}}
  
  Provide the full JSON output for both Avalanche and Snowball plans.`,
});


const debtPayoffCalculatorFlow = ai.defineFlow(
  {
    name: 'debtPayoffCalculatorFlow',
    inputSchema: DebtPayoffInputSchema,
    outputSchema: DebtPayoffOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
