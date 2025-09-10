
"use client";

import { BudgetGoals } from "@/components/dashboard/budget-goals";

export default function BudgetsPage() {
    return (
        <div className="p-4 sm:px-6">
             <div className="space-y-2 mb-6">
                <h1 className="text-2xl font-bold font-headline tracking-tight">Budgets</h1>
                <p className="text-muted-foreground">Create and track your budget goals.</p>
            </div>
            <div className="max-w-2xl">
              <BudgetGoals />
            </div>
        </div>
    );
}
