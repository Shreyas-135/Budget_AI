
"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import {
  Briefcase,
  Car,
  Download,
  Home,
  PlusCircle,
  Repeat,
  ShoppingBag,
  UtensilsCrossed,
  Calendar as CalendarIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";


export type Transaction = {
  icon: React.ElementType;
  category: string;
  description: string;
  amount: number;
  date: string;
};

const initialExpenses: Transaction[] = [
  { icon: UtensilsCrossed, category: "Food", description: "Groceries from SuperMart", amount: -78.54, date: new Date().toISOString().split('T')[0] },
  { icon: Car, category: "Transport", description: "Monthly train pass", amount: -120.0, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { icon: ShoppingBag, category: "Shopping", description: "New shoes from Zappos", amount: -149.99, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { icon: Home, category: "Housing", description: "Rent for this month", amount: -1500.0, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

const initialIncome: Transaction[] = [
  { icon: Briefcase, category: "Salary", description: "Monthly paycheck", amount: 5329.0, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
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

export function TransactionsTable() {
  const [expenses, setExpenses] = useState<Transaction[]>(initialExpenses);
  const [income, setIncome] = useState<Transaction[]>(initialIncome);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({ from: addDays(new Date(), -30), to: new Date() });
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "expense" as "income" | "expense", description: "", amount: 0, category: "" },
  });

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    const newTransaction: Transaction = {
        icon: getIconForCategory(data.category),
        category: data.category,
        description: data.description,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
        date: new Date().toISOString().split('T')[0],
    };

    if (data.type === 'expense') setExpenses(prev => [newTransaction, ...prev]);
    else setIncome(prev => [newTransaction, ...prev]);
    
    toast({ title: "Success", description: "Transaction added successfully." });
    setIsDialogOpen(false);
    form.reset();
  };

  const filterTransactions = (transactions: Transaction[]) => {
    if (!date?.from) return transactions;
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= date.from! && transactionDate <= (date.to || new Date());
    });
  };

  const convertToCSV = (transactions: Transaction[]) => {
    const headers = ["Date", "Description", "Category", "Amount"];
    const rows = transactions.map(t => [t.date, t.description, t.category, t.amount].join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  const handleExport = (type: 'income' | 'expenses') => {
    const data = type === 'income' ? filterTransactions(income) : filterTransactions(expenses);
    if(data.length === 0){
        toast({ title: "No Data", description: "There is no data to export for the selected date range.", variant: "destructive" });
        return;
    }

    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) URL.revokeObjectURL(link.href);
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully.` });
  }

  return (
    <Card>
      <CardHeader>
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
                <CardTitle className="font-headline">Transactions History</CardTitle>
                <CardDescription>View, filter, and export your transactions.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn("w-full sm:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1 w-full sm:w-auto">
                            <PlusCircle className="h-4 w-4" />
                            Add Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Transaction</DialogTitle>
                            <DialogDescription>Add a new income or expense to your account.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                                {/* Form fields */}
                                <DialogFooter>
                                    <Button type="submit">Save Transaction</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
         </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="expenses">
             <div className="flex justify-end mb-4">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExport('expenses')}>
                    <Download className="h-4 w-4" />
                    Export
                </Button>
             </div>
            <TransactionTable transactions={filterTransactions(expenses)} />
          </TabsContent>
          <TabsContent value="income">
             <div className="flex justify-end mb-4">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExport('income')}>
                    <Download className="h-4 w-4" />
                    Export
                </Button>
             </div>
            <TransactionTable transactions={filterTransactions(income)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="border rounded-md">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.length > 0 ? transactions.map((transaction, index) => (
                <TableRow key={index}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                        <transaction.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), 'PPP')}
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
                )) : (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No transactions for this period.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
  );
}
