import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { notFound } from "next/navigation";
import { TransactionTable } from "@/components/transaction-table";
import { AccountChart } from "@/components/account-chart";

export default async function AccountCom({ accId }) {
  const accountData = await getAccountWithTransactions(accId);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="container mx-auto my-32">
      <div className="space-y-8 px-5">
        <div className="flex gap-4 items-end justify-between">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
              {account.name}
            </h1>
            <p className="text-muted-foreground">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
            </p>
          </div>

          <div className="text-right pb-2">
            <div className="text-xl sm:text-2xl font-bold">
              ${parseFloat(account.balance).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {account._count.transactions} Transactions
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#7dc03a" />}
        >
          <AccountChart transactions={transactions} />
        </Suspense>

        {/* Transactions Table */}
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#7dc03a" />}
        >
          <TransactionTable transactions={transactions} />
        </Suspense>
      </div>
    </div>
  );
}
