"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Robot from "@/components/icons/Robot";
import AILogo from "@/components/icons/AILogo";
import {
  generateFinancialHealthReport,
  generateCashFlowBudgetReport,
} from "@/actions/AI";
import Markdown from "react-markdown";
import { GridLoader } from "react-spinners";

function summarizeTransactions(transactions) {
  let allTimeTotalIncome = 0;
  let allTimeTotalExpense = 0;

  const summary = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${date.getFullYear()}`;
    const type = transaction.type; // Either "INCOME" or "EXPENSE"
    const category = transaction.category;

    if (!acc[monthYear]) {
      acc[monthYear] = { totalIncome: 0, totalExpense: 0, INCOME: {}, EXPENSE: {} };
    }

    if (!acc[monthYear][type][category]) {
      acc[monthYear][type][category] = 0;
    }

    acc[monthYear][type][category] += transaction.amount;

    if (type === "INCOME") {
      acc[monthYear].totalIncome += transaction.amount;
      allTimeTotalIncome += transaction.amount;
    } else if (type === "EXPENSE") {
      acc[monthYear].totalExpense += transaction.amount;
      allTimeTotalExpense += transaction.amount;
    }

    return acc;
  }, {});

  return {
    allTimeTotalIncome,
    allTimeTotalExpense,
    CurrentBalance: allTimeTotalIncome - allTimeTotalExpense,
    ...summary,
  };
}

export function AIDashboardInput({ accounts, transactions }) {
  const accountsArray = Array.isArray(accounts) ? accounts : [];
  const transactionsArray = Array.isArray(transactions) ? transactions : [];
  const [selectedAccountId, setSelectedAccountId] = useState(
    accountsArray.find((a) => a.isDefault)?.id || accountsArray[0]?.id
  );
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter transactions for selected account
  const accountTransactions = transactionsArray.filter(
    (t) => t.accountId === selectedAccountId
  );
  const summarizedData = summarizeTransactions(accountTransactions);

  // Function to call the AI action for Financial Health Score Report
  async function handleGenerateHealthReport() {
    setLoading(true);
    setReport("");
    try {
      const reportText = await generateFinancialHealthReport(summarizedData);
      setReport(reportText);
    } catch (error) {
      setReport("Failed to generate Financial Health Report.");
    }
    setLoading(false);
  }

  // Function to call the AI action for Cash Flow & Budgeting Report
  async function handleGenerateCashFlowReport() {
    setLoading(true);
    setReport("");
    try {
      const reportText = await generateCashFlowBudgetReport(summarizedData);
      setReport(reportText);
    } catch (error) {
      setReport("Failed to generate Cash Flow & Budgeting Report.");
    }
    setLoading(false);
  }

  return (
    <div className="grid md:grid-cols-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">AI Cash Flow Insights</CardTitle>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accountsArray.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="w-full flex flex-col gap-6 items-center">
            {!loading && !report && (
              <div className="flex flex-col gap-6 items-center [&>svg]:size-[120px]">
                <Robot />
                <h2 className="text-xl font-bold text-gray-800">
                  Analyze Your Financial Landscape with AI
                </h2>
              </div>
            )}
            {loading && (
              <div className="flex flex-col gap-6 items-center justify-center h-[400px]">
                <GridLoader width={"100%"} color="#7dc03a" />
              </div>
            )}
            {report && (
              <div className="p-6 h-[400px] overflow-y-scroll">
                <div className="flex flex-col gap-5 text-sm">
                  <Markdown>{report}</Markdown>
                </div>
              </div>
            )}
            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-500"
                onClick={handleGenerateHealthReport}
                disabled={loading}
              >
                <span className="[&>svg]:size-[80px]">
                  <AILogo />
                </span>{" "}
                Financial Health Score Report
              </Button>
              <Button
                type="button"
                className="flex-1 bg-green-600 hover:bg-green-400"
                onClick={handleGenerateCashFlowReport}
                disabled={loading}
              >
                <span className="[&>svg]:size-[80px]">
                  <AILogo />
                </span>{" "}
                Cash Flow & Budgeting Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
