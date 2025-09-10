"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart as PieChartIcon, UtensilsCrossed, Car, ShoppingBag, Home, Heart } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: 'Food', value: 400, icon: UtensilsCrossed, color: 'hsl(var(--chart-1))' },
  { name: 'Transport', value: 300, icon: Car, color: 'hsl(var(--chart-2))' },
  { name: 'Shopping', value: 300, icon: ShoppingBag, color: 'hsl(var(--chart-3))' },
  { name: 'Housing', value: 200, icon: Home, color: 'hsl(var(--chart-4))' },
  { name: 'Health', value: 278, icon: Heart, color: 'hsl(var(--chart-5))' },
];

export function SpendingBreakdown() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
            <PieChartIcon className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Spending Breakdown</CardTitle>
        </div>
        <CardDescription>
          Your top spending categories this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 items-center">
            <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip 
                             contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))'
                            }}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-2">
                {data.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-muted-foreground">{entry.name}</span>
                        <span className="ml-auto font-medium">${entry.value.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
