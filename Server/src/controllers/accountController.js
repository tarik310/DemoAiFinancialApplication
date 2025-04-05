import { db } from "../../lib/prisma.js";
import { serializeDecimal, serializeTransaction } from "./helperFunctions.js";

export const getAccountWithTransactions = async (req, res) => {
  try {
    const { accid, userid } = req.params;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });

    const account = await db.account.findUnique({
      where: {
        id: accid,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) return res.status(404).json({ message: "Account wasn't found" });

    return res.json({
      ...serializeDecimal(account),
      transactions: account.transactions.map(serializeDecimal),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error retrieving data", error });
  }
};

export const bulkDeleteTransactions = async (req, res) => {
  try {
    const { userid } = req.params;
    const { transactionIds } = req.body;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });
    if (!transactions)
      return res.status(404).json({ message: "Transactions wasn't found" });
    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount.toNumber()
          : -transaction.amount.toNumber();
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Deleting data", error });
  }
};

export const updateDefaultAccount = async (req, res) => {
  try {
    const { accid, userid } = req.params;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accid,
        userId: user.id,
      },
      data: { isDefault: true },
    });
    return res.json({ success: true, data: serializeTransaction(account) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Updating data", error });
  }
};
