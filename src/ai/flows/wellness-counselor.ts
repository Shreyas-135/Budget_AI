'use server';

/**
 * @fileOverview A conversational AI wellness counselor for financial stress.
 * 
 * - wellnessCounselor - A function that chats with the AI counselor.
 * - WellnessCounselorInput - The input type for the wellnessCounselor function.
 * - WellnessCounselorOutput - The return type for the wellnessCounselor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData } from 'genkit';

const WellnessCounselorInputSchema = z.object({
  history: z.array(z.any()).optional().describe('The chat history.'),
  prompt: z.string().describe('The user\'s message.'),
});
export type WellnessCounselorInput = z.infer<typeof WellnessCounselorInputSchema>;

const WellnessCounselorOutputSchema = z.object({
    response: z.string().describe('The counselor\'s empathetic response.'),
});
export type WellnessCounselorOutput = z.infer<typeof WellnessCounselorOutputSchema>;

const wellnessCounselorPrompt = ai.definePrompt({
    name: 'wellnessCounselorPrompt',
    system: `You are an AI Financial Wellness Counselor.
    Your role is to be a supportive, empathetic, and non-judgmental listener.
    Users will talk to you about their financial stress, anxiety, and habits.
    
    Your primary goals are:
    - To help users explore their feelings and thoughts about money in a safe space.
    - To provide encouragement and normalize their feelings.
    - To offer general, supportive advice on developing healthier financial mindsets (e.g., mindfulness, self-compassion).
    - To detect signs of serious distress.

    IMPORTANT: You are NOT a licensed therapist, financial advisor, or medical professional.
    If the user's messages indicate severe distress, a crisis, or if they ask for professional financial or legal advice, you MUST gently guide them to seek help from a qualified professional and state that you are an AI and not equipped to provide that level of help.
    
    Maintain a calm, reassuring, and kind tone at all times. Use conversational language.
    `,
});

const wellnessCounselorFlow = ai.defineFlow(
  {
    name: 'wellnessCounselorFlow',
    inputSchema: WellnessCounselorInputSchema,
    outputSchema: WellnessCounselorOutputSchema,
  },
  async (input) => {
    const { history, prompt } = input;
    
    const llmResponse = await wellnessCounselorPrompt({
      history,
      prompt,
    });
    
    return {
        response: llmResponse.text!,
    };
  }
);

export async function wellnessCounselor(input: WellnessCounselorInput): Promise<WellnessCounselorOutput> {
  return wellnessCounselorFlow(input);
}
