
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getDebtPayoffPlan,
  type DebtPayoffInput,
  type DebtPayoffOutput,
} from "@/ai/flows/debt-payoff-calculator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, PlusCircle, Trash2, Wand2, ArrowRight, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

const DebtPayoffInputSchema = z.object({
  debts: z.array(
    z.object({
      name: z.string().min(1, "Debt name is required."),
      balance: z.coerce.number().min(0, "Balance must be a positive number."),
      apr: z.coerce.number().min(0, "APR must be a positive number."),
      minimumPayment: z.coerce.number().min(0, "Minimum payment must be a positive number."),
    })
  ).min(1, "Please add at least one debt."),
  extraPayment: z.coerce.number().optional(),
});


export function DebtPayoffCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebtPayoffOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<DebtPayoffInput>({
    resolver: zodResolver(DebtPayoffInputSchema),
    defaultValues: {
      debts: [
        { name: "Credit Card", balance: 5000, apr: 22.9, minimumPayment: 150 },
        { name: "Student Loan", balance: 20000, apr: 5.8, minimumPayment: 250 },
      ],
      extraPayment: 100,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "debts",
  });

  const onSubmit = async (data: DebtPayoffInput) => {
    setLoading(true);
    setResult(null);
    try {
      const plan = await getDebtPayoffPlan(data);
      setResult(plan);
    } catch (error) {
      console.error("Error calculating debt payoff plan:", error);
      toast({
        title: "Error",
        description: "Failed to calculate plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ title, plan, isRecommended }: { title: string; plan: DebtPayoffOutput['avalanche'], isRecommended?: boolean }) => (
    <Card className="bg-muted/50 flex-1">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-lg">{title}</CardTitle>
            {isRecommended && <Badge><Trophy className="mr-1.5 h-3 w-3" />Recommended</Badge>}
        </div>
        <CardDescription>
          Debt-free in <strong>{plan.totalMonths} months</strong>. Total interest paid: <strong>${(plan.totalInterestPaid ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-semibold mb-2">First 12 Months Payment Plan:</h4>
        <ScrollArea className="h-64">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Month</TableHead>
                <TableHead>Debt</TableHead>
                <TableHead className="text-right">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.breakdown.map((step) => (
                <TableRow key={`${title}-${step.month}-${step.debtName}`}>
                  <TableCell>{step.month}</TableCell>
                  <TableCell>{step.debtName}</TableCell>
                  <TableCell className="text-right">${step.paymentAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">AI Debt Payoff Calculator</CardTitle>
        </div>
        <CardDescription>
          Compare Avalanche vs. Snowball methods to pay off your debt faster.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col">
          <CardContent className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium">Your Debts</Label>
                    <ScrollArea className="h-48 mt-2 pr-4">
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                        <div key={field.id} className="p-3 rounded-md border bg-background/50 space-y-2 relative">
                             <div className="grid grid-cols-2 gap-2">
                                <FormField control={form.control} name={`debts.${index}.name`} render={({ field }) => ( <FormItem> <FormLabel className="text-xs">Name</FormLabel> <FormControl><Input placeholder="e.g. Credit Card" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                <FormField control={form.control} name={`debts.${index}.balance`} render={({ field }) => ( <FormItem> <FormLabel className="text-xs">Balance</FormLabel> <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <FormField control={form.control} name={`debts.${index}.apr`} render={({ field }) => ( <FormItem> <FormLabel className="text-xs">APR (%)</FormLabel> <FormControl><Input type="number" placeholder="22.9" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                <FormField control={form.control} name={`debts.${index}.minimumPayment`} render={({ field }) => ( <FormItem> <FormLabel className="text-xs">Min. Payment</FormLabel> <FormControl><Input type="number" placeholder="150" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                             </div>
                             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1} className="absolute top-1 right-1 h-6 w-6"> <Trash2 className="h-4 w-4" /> </Button>
                        </div>
                        ))}
                    </div>
                    </ScrollArea>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: "", balance: 0, apr: 0, minimumPayment: 0 })}> <PlusCircle className="mr-2 h-4 w-4" /> Add Debt </Button>
                </div>

                <div className="space-y-4">
                    <FormField control={form.control} name="extraPayment" render={({ field }) => ( <FormItem> <FormLabel>Extra Monthly Payment</FormLabel> <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <Button type="submit" disabled={loading} className="w-full"> {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Calculate Payoff Plan </Button>
                </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex-col items-stretch">
            {loading && (
              <div className="mt-4 text-center text-muted-foreground flex items-center justify-center"> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing your debts... </div>
            )}
            {result && (
                <div className="mt-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <PlanCard title="Avalanche Plan" plan={result.avalanche} isRecommended={result.avalanche.totalInterestPaid < result.snowball.totalInterestPaid} />
                        <PlanCard title="Snowball Plan" plan={result.snowball} isRecommended={result.snowball.totalInterestPaid < result.avalanche.totalInterestPaid} />
                    </div>
                </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
