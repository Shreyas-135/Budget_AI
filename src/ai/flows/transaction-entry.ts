'use server';

/**
 * @fileOverview An AI-powered transaction entry tool that parses natural language.
 *
 * - createTransaction - A tool that creates a transaction from a natural language string.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionSchema = z.object({
  description: z.string().describe('The description of the transaction (e.g., "Starbucks", "Monthly rent").'),
  amount: z.number().describe('The amount of the transaction.'),
  category: z.string().describe('A suitable category for the transaction (e.g., "Food & Drink", "Housing", "Transport").'),
  type: z.enum(['income', 'expense']).describe('The type of transaction.'),
});

export const createTransaction = ai.defineTool(
  {
    name: 'createTransaction',
    description: 'Creates a transaction record from a natural language description. Use this when the user asks to record or log a transaction.',
    inputSchema: z.object({
        text: z.string().describe("The user's natural language description of the transaction."),
    }),
    outputSchema: TransactionSchema,
  },
  async (input) => {
    // This is a placeholder for actually saving the transaction.
    // In a real app, this would write to a database.
    // For now, we'll just use an LLM to parse the text and return the structured data.
    console.log(`Parsing transaction: ${input.text}`);
    
    const parsingPrompt = ai.definePrompt({
        name: 'transactionParsingPrompt',
        input: { schema: z.object({ text: z.string() }) },
        output: { schema: TransactionSchema },
        prompt: `Parse the following text and extract the transaction details. Infer the category and whether it's an income or expense. Today's date is ${new Date().toLocaleDateString()}.
        
        Text: "{{text}}"`,
    });

    const { output } = await parsingPrompt({ text: input.text });
    
    if (!output) {
      throw new Error("Failed to parse transaction");
    }

    console.log('Parsed transaction:', output);
    return output;
  }
);
