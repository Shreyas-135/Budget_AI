'use server';

import { getStockInsights } from '@/ai/flows/stock-insights';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json({ error: 'Missing required field: ticker' }, { status: 400 });
    }

    const insights = await getStockInsights({
      ticker,
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error in stock-insights API route:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
