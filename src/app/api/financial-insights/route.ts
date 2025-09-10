'use server';

import { getFinancialInsights } from '@/ai/flows/financial-insights';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { income, expenses, savingsGoal } = body;

    if (!income || !expenses) {
      return NextResponse.json({ error: 'Missing required fields: income and expenses' }, { status: 400 });
    }

    const insights = await getFinancialInsights({
      income,
      expenses,
      savingsGoal,
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error in financial-insights API route:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
