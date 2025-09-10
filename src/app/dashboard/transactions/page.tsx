
"use client";

import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function TransactionsPage() {
  return (
    <div className="p-4 sm:px-6">
        <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-bold font-headline tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">View and manage all your income and expenses.</p>
        </div>
        <RecentTransactions />
    </div>
  );
}
