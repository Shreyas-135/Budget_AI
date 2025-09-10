
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

const goals = [
  {
    name: "Vacation to Hawaii",
    target: 5000,
    current: 3250,
  },
  {
    name: "New Laptop",
    target: 2000,
    current: 1800,
  },
  {
    name: "Emergency Fund",
    target: 10000,
    current: 4000,
  },
];

export function BudgetGoals() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Budget Goals</CardTitle>
        </div>
        <CardDescription>
          Track your progress towards your financial goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.name}>
              <div className="flex justify-between mb-2 items-center">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-sm font-bold text-primary">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={progress} aria-label={`${goal.name} progress`} />
               <div className="flex justify-end mt-1">
                 <span className="text-xs text-muted-foreground">
                    ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                </span>
               </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
