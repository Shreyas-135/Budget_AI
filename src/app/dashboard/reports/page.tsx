
"use client";

import { TransactionsTable } from "@/components/dashboard/transactions-table";

export default function ReportsPage() {
    return (
        <div className="p-4 sm:px-6">
            <div className="space-y-2 mb-6">
                <h1 className="text-2xl font-bold font-headline tracking-tight">Transactions Report</h1>
                <p className="text-muted-foreground">Analyze your financial performance with advanced filtering.</p>
            </div>
           <TransactionsTable />
        </div>
    );
}
