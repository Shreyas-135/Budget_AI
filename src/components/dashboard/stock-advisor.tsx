
"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getStockInsights,
  type StockInsightsInput,
  type StockInsightsOutput,
} from "@/ai/flows/stock-insights";

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
import { Loader2, RefreshCw, TrendingUp, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const stockInsightsSchema = z.object({
  ticker: z.string().min(1, "Ticker symbol is required.").max(5, "Ticker must be 5 characters or less."),
});

const RecommendationBadge = ({ recommendation }: { recommendation: StockInsightsOutput['recommendation'] }) => {
    const variant = {
        'Buy': 'default',
        'Hold': 'secondary',
        'Sell': 'destructive'
    }[recommendation] as "default" | "secondary" | "destructive";

    return <Badge variant={variant}>{recommendation}</Badge>;
}

export function StockAdvisor() {
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState<StockInsightsOutput | null>(null);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<StockInsightsInput>({
    resolver: zodResolver(stockInsightsSchema),
    defaultValues: {
      ticker: "GOOGL",
    },
  });

  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const onSubmit = async (data: StockInsightsInput) => {
    setLoading(true);
    setResult(null);
    clearPolling(); // Stop any previous polling
    try {
      const insights = await getStockInsights(data);
      setResult(insights);
      // Start polling for new data
      intervalRef.current = setInterval(async () => {
        try {
          setIsPolling(true);
          const newInsights = await getStockInsights(data);
          setResult(newInsights);
        } catch (error) {
            console.error("Error polling stock insights:", error);
            // Silently fail on poll
        } finally {
            setIsPolling(false);
        }
      }, 10000); // Poll every 10 seconds

    } catch (error) {
      console.error("Error getting stock insights:", error);
      toast({
        title: "Error",
        description: "Failed to get AI insights for the stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">AI Stock Advisor</CardTitle>
        </div>
        <CardDescription>
          Get AI-powered insights on stock performance. Data refreshes automatically.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col">
          <CardContent className="space-y-4 flex-grow">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Ticker Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AAPL, TSLA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-stretch">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get Insights
            </Button>

            {loading && (
              <div className="mt-4 text-center text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing stock data...
              </div>
            )}
            
            {result && (
              <Card className="mt-4 bg-muted/50">
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold font-headline">Analysis for {form.getValues('ticker').toUpperCase()}</h4>
                            <p className="text-2xl font-bold">${result.price.toFixed(2)}</p>
                        </div>
                        {isPolling && <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />}
                    </div>

                    <p className="text-sm text-muted-foreground">{result.analysis}</p>
                    
                    <div className="flex items-center justify-between gap-4 pt-2">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Recommendation</p>
                            <RecommendationBadge recommendation={result.recommendation} />
                        </div>
                        <div className="space-y-1 text-right">
                             <p className="text-xs font-semibold text-muted-foreground">Confidence</p>
                             <p className="font-bold text-sm">{(result.confidenceScore * 100).toFixed(0)}%</p>
                        </div>
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
