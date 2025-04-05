import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "@/components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function TransactionCom({ editId }) {
  const accounts = await getUserAccounts();

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="container mx-auto my-32">
      <div className=" max-w-full flex flex-col justify-center items-center gap-3">
        <div className="flex justify-center md:justify-normal mb-1">
          <h1 className="text-5xl gradient-title ">Add Transaction</h1>
        </div>
        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
          editMode={!!editId}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
