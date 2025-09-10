'use server';

import { getTaxCalculation } from '@/ai/flows/tax-calculator';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { income, filingStatus } = body;

    if (!income || !filingStatus) {
      return NextResponse.json({ error: 'Missing required fields: income and filingStatus' }, { status: 400 });
    }

    const calculation = await getTaxCalculation({
      income,
      filingStatus,
    });

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error in tax-calculator API route:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
