"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  "9M": { label: "Last 9 Months", days: 270 },
  ALL: { label: "All Time", days: null },
};

export function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("3M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within date range
    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    let grouped;
    // Group by day if "7D" or "1M", else group by month
    if (dateRange === "7D" || dateRange === "1M") {
      grouped = filtered.reduce((acc, transaction) => {
        const transactionDate = startOfDay(new Date(transaction.date));
        const dayLabel = format(transactionDate, "dd-MM-yyyy");
        if (!acc[dayLabel]) {
          acc[dayLabel] = {
            date: dayLabel,
            income: 0,
            expense: 0,
            timestamp: transactionDate.getTime(),
          };
        }
        if (transaction.type === "INCOME") {
          acc[dayLabel].income += transaction.amount;
        } else {
          acc[dayLabel].expense += transaction.amount;
        }
        return acc;
      }, {});
    } else {
      grouped = filtered.reduce((acc, transaction) => {
        const transactionDate = new Date(transaction.date);
        const monthStart = startOfMonth(transactionDate);
        const monthLabel = format(monthStart, "MM-yyyy");
        if (!acc[monthLabel]) {
          acc[monthLabel] = {
            date: monthLabel,
            income: 0,
            expense: 0,
            timestamp: monthStart.getTime(),
          };
        }
        if (transaction.type === "INCOME") {
          acc[monthLabel].income += transaction.amount;
        } else {
          acc[monthLabel].expense += transaction.amount;
        }
        return acc;
      }, {});
    }

    // Convert grouped data into an array and sort by timestamp
    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions, dateRange]);

  // Calculate totals for the selected period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, period) => ({
        income: acc.income + period.income,
        expense: acc.expense + period.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-normal">Transaction Overview</CardTitle>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-500">
              ${totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold text-red-500">${totals.expense.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Current Balance</p>
            <p
              className={`text-lg font-bold ${
                totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ${(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1_000_000
                    ? `$${value / 1_000_000}M`
                    : value >= 1_000
                    ? `$${value / 1_000}k`
                    : `$${value}`
                }
              />
              <Tooltip
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
