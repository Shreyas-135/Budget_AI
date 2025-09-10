
"use client";

import { useState } from "react";
import {
  Briefcase,
  Car,
  Home,
  PlusCircle,
  Repeat,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { useToast } from "@/hooks/use-toast";


type Transaction = {
  icon: React.ElementType;
  category: string;
  description: string;
  amount: number;
  date: string;
};

const initialExpenses: Transaction[] = [
  {
    icon: UtensilsCrossed,
    category: "Food",
    description: "Groceries from SuperMart",
    amount: -78.54,
    date: new Date().toISOString().split('T')[0],
  },
  {
    icon: Car,
    category: "Transport",
    description: "Monthly train pass",
    amount: -120.0,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    icon: ShoppingBag,
    category: "Shopping",
    description: "New shoes from Zappos",
    amount: -149.99,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    icon: Home,
    category: "Housing",
    description: "Rent for this month",
    amount: -1500.0,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

const initialIncome: Transaction[] = [
  {
    icon: Briefcase,
    category: "Salary",
    description: "Monthly paycheck",
    amount: 5329.0,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  category: z.string().min(1, "Category is required."),
});


const categoryIcons: Record<string, React.ElementType> = {
    Food: UtensilsCrossed,
    Transport: Car,
    Shopping: ShoppingBag,
    Housing: Home,
    Salary: Briefcase,
    Default: Repeat
}

const getIconForCategory = (category: string) => {
    return categoryIcons[category] || categoryIcons.Default;
}

export function RecentTransactions() {
  const [expenses, setExpenses] = useState<Transaction[]>(initialExpenses);
  const [income, setIncome] = useState<Transaction[]>(initialIncome);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense" as "income" | "expense",
      description: "",
      amount: 0,
      category: "",
    },
  });

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    const newTransaction: Transaction = {
        icon: getIconForCategory(data.category),
        category: data.category,
        description: data.description,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
        date: new Date().toISOString().split('T')[0],
    };

    if (data.type === 'expense') {
        setExpenses(prev => [newTransaction, ...prev]);
    } else {
        setIncome(prev => [newTransaction, ...prev]);
    }
    
    toast({
        title: "Success",
        description: "Transaction added successfully.",
    })
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2">
              <Repeat className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Recent Transactions</CardTitle>
           </div>
          <CardDescription>
            A list of your recent income and expenses.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>
                Add a new income or expense to your account.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Type</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="expense">Expense</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Description</Label>
                                <FormControl>
                                    <Input placeholder="e.g. Groceries" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Amount</Label>
                                <FormControl>
                                    <Input type="number" placeholder="e.g. 78.54" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Category</Label>
                                <FormControl>
                                    <Input placeholder="e.g. Food" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit">Save Transaction</Button>
                    </DialogFooter>
                </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses">
            <TransactionTable transactions={expenses.slice(0,5)} />
          </TabsContent>
          <TabsContent value="income">
            <TransactionTable transactions={income.slice(0,5)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <transaction.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.date}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell
              className={`text-right font-semibold ${
                transaction.amount > 0 ? "text-green-600" : "text-destructive"
              }`}
            >
              {transaction.amount < 0
                ? `-$${Math.abs(transaction.amount).toFixed(2)}`
                : `$${transaction.amount.toFixed(2)}`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
