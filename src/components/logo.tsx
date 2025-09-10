import { PiggyBank } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary/20 p-2 rounded-lg">
        <PiggyBank className="h-5 w-5 text-primary" />
      </div>
      <span className="text-lg font-bold font-headline text-foreground">
        AutoBudget AI
      </span>
    </div>
  );
}
