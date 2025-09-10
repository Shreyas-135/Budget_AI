
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getTaxCalculation,
  TaxCalculatorInput,
  TaxCalculatorOutput,
} from "@/ai/flows/tax-calculator";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Calculator, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TaxCalculatorInputSchema = z.object({
  income: z.coerce.number().min(1, "Income is required."),
  filingStatus: z.enum(['single', 'married_jointly', 'married_separately', 'head_of_household']),
});

export function TaxCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxCalculatorOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<TaxCalculatorInput>({
    resolver: zodResolver(TaxCalculatorInputSchema),
    defaultValues: {
      income: 50000,
      filingStatus: "single",
    },
  });

  const onSubmit = async (data: TaxCalculatorInput) => {
    setLoading(true);
    setResult(null);
    try {
      const taxData = await getTaxCalculation(data);
      setResult(taxData);
    } catch (error) {
      console.error("Error calculating taxes:", error);
      toast({
        title: "Error",
        description: "Failed to calculate taxes. Please try again.",
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
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">AI Tax Calculator</CardTitle>
        </div>
        <CardDescription>
          Estimate your federal income tax liability with our AI-powered calculator.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col">
            <CardContent className="grid md:grid-cols-2 gap-6 flex-grow">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Annual Income</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 65000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="filingStatus"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Filing Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a filing status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married_jointly">Married Filing Jointly</SelectItem>
                            <SelectItem value="married_separately">Married Filing Separately</SelectItem>
                            <SelectItem value="head_of_household">Head of Household</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <Button type="submit" disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Calculate
                    </Button>
                </div>
                 <div className="flex-grow">
                    {result && (
                        <Card className="bg-muted/50 h-full">
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">Estimated Tax</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-3xl font-bold">${result.estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-muted-foreground">Effective Tax Rate: {result.effectiveRate.toFixed(2)}%</p>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead>Bracket</TableHead>
                                        <TableHead>Taxable</TableHead>
                                        <TableHead className="text-right">Tax Paid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.breakdown.map((item) => (
                                        <TableRow key={item.bracket}>
                                            <TableCell>{item.bracket}</TableCell>
                                            <TableCell>${item.taxableAmount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">${item.taxPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                    {loading && (
                        <div className="h-full flex items-center justify-center text-muted-foreground rounded-lg bg-muted/50">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                           <p>Calculating your taxes...</p> 
                        </div>
                    )}
                </div>
            </CardContent>
        </form>
      </Form>
    </Card>
  );
}
