'use server';

/**
 * @fileOverview A personal financial assistant that can answer questions using tools.
 * 
 * - personalAssistant - A function that chats with a financial assistant.
 * - PersonalAssistantInput - The input type for the personalAssistant function.
 * - PersonalAssistantOutput - The return type for the personalAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStockPrice } from './stock-insights';
import { getTaxCalculation } from './tax-calculator';
import { getFinancialInsights } from './financial-insights';
import { createTransaction } from './transaction-entry';
import { MessageData } from 'genkit';

const PersonalAssistantInputSchema = z.object({
  history: z.array(z.any()).optional().describe('The chat history.'),
  prompt: z.string().describe('The user\'s question or prompt.'),
});
export type PersonalAssistantInput = z.infer<typeof PersonalAssistantInputSchema>;

const PersonalAssistantOutputSchema = z.object({
    response: z.string().describe('The assistant\'s response.'),
});
export type PersonalAssistantOutput = z.infer<typeof PersonalAssistantOutputSchema>;

const personalAssistantPrompt = ai.definePrompt({
    name: 'personalAssistantPrompt',
    tools: [getStockPrice, getTaxCalculation, getFinancialInsights, createTransaction],
    system: `You are a helpful, friendly, and conversational personal financial assistant.
    Your goal is to help users understand their finances and make better decisions.
    - When asked for data, convert it into a narrative insight (financial storytelling).
    - Engage in interactive dialogue to provide financial education.
    - If you have the user's income and expenses, you can provide financial insights.
    - If the user asks you to record a transaction, use the createTransaction tool.
    - If the user asks about stock prices or taxes, use the appropriate tools.
    - Remember previous interactions to provide context-aware responses.
    - If you don't know the answer, say that you don't know.`,
});

const personalAssistantFlow = ai.defineFlow(
  {
    name: 'personalAssistantFlow',
    inputSchema: PersonalAssistantInputSchema,
    outputSchema: PersonalAssistantOutputSchema,
  },
  async (input) => {
    const { history, prompt } = input;
    
    const llmResponse = await personalAssistantPrompt({
      history,
      prompt,
    });
    
    const toolRequest = llmResponse.toolRequest();
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      const llmResponse2 = await personalAssistantPrompt({
        history: (history || []).concat(llmResponse.history() || [], toolResponse.history() || []),
        prompt,
      });
      return {
        response: llmResponse2.text(),
      };
    }

    return {
        response: llmResponse.text(),
    };
  }
);

export async function personalAssistant(input: PersonalAssistantInput): Promise<PersonalAssistantOutput> {
  return personalAssistantFlow(input);
}
