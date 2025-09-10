
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getFinancialInsights,
  type FinancialInsightsInput,
  type FinancialInsightsOutput,
} from "@/ai/flows/financial-insights";

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
import { Loader2, PlusCircle, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const financialInsightsSchema = z.object({
  income: z.coerce.number().min(0, "Income must be a positive number."),
  expenses: z.array(
    z.object({
      category: z.string().min(1, "Category is required."),
      amount: z.coerce.number().min(0, "Amount must be a positive number."),
    })
  ).min(1, "Please add at least one expense."),
  savingsGoal: z.coerce.number().optional(),
});

export function AIAdvisor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FinancialInsightsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FinancialInsightsInput>({
    resolver: zodResolver(financialInsightsSchema),
    defaultValues: {
      income: 5000,
      expenses: [
        { category: "Rent", amount: 1500 },
        { category: "Groceries", amount: 400 },
        { category: "Transport", amount: 200 },
        { category: "Utilities", amount: 150 },
      ],
      savingsGoal: 1000,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

  const onSubmit = async (data: FinancialInsightsInput) => {
    setLoading(true);
    setResult(null);
    try {
      const insights = await getFinancialInsights(data);
      setResult(insights);
    } catch (error) {
      console.error("Error getting financial insights:", error);
      toast({
        title: "Error",
        description: "Failed to get AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">AI Financial Advisor</CardTitle>
        </div>
        <CardDescription>
          Get personalized advice based on your income and spending.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col">
          <CardContent className="space-y-4 flex-grow">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="savingsGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Savings Goal</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Expenses</Label>
              <ScrollArea className="h-48 mt-2 pr-4">
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.category`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            {index === 0 && <FormLabel>Category</FormLabel>}
                            <FormControl>
                              <Input placeholder="e.g., Groceries" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="w-1/3">
                            {index === 0 && <FormLabel>Amount</FormLabel>}
                            <FormControl>
                              <Input type="number" placeholder="e.g., 400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ category: "", amount: 0 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Insights
            </Button>

            {loading && (
              <div className="mt-4 text-center text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing your data...
              </div>
            )}
            
            {result && (
              <Card className="mt-4 bg-muted/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-bold font-headline">Summary</h4>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-bold font-headline">Advice</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                      {result.advice.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
