import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "@/components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "@/components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "@/components/transaction-overview";
import { AIDashboardInput } from "@/components/AI-Analyzes";

export default async function DashboardCom() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  // Default to an empty array if accounts is not an array
  const accountsArray = Array.isArray(accounts) ? accounts : [];
  const defaultAccount = accountsArray.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md hover:border-blue-500 transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5 group">
              <Plus className="h-10 w-10 mb-2 group-hover:text-blue-500 transition-colors" />
              <p className="text-sm font-medium group-hover:text-blue-500 transition-colors">
                Add New Account
              </p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts?.map((account) => <AccountCard key={account.id} account={account} />)}
      </div>
      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />
      {/* Dashboard Overview */}
      <DashboardOverview accounts={accounts} transactions={transactions || []} />
      {/* AI Dashboard Input */}
      <AIDashboardInput accounts={accounts} transactions={transactions || []} />
    </div>
  );
}
