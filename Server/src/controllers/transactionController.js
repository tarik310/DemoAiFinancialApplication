import { db } from "../../lib/prisma.js";
import { calculateNextRecurringDate, serializeAmount } from "./helperFunctions.js";

export const createTransaction = async (req, res) => {
  try {
    const { userid } = req.params;
    const data = req.body;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return res.status(404).json({ success: false, message: "Account wasn't found" });
    }

    // Calculate new balance
    const amount = Number(data.amount);
    const balanceChange = data.type === "EXPENSE" ? -amount : amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });
    return res.json({ success: true, data: serializeAmount(transaction) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Creating data", error });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const { transid, userid } = req.params;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });
    const transaction = await db.transaction.findUnique({
      where: {
        id: transid,
        userId: user.id,
      },
    });

    if (!transaction) res.status(404).json({ message: "Transaction not found" });
    return res.json(serializeAmount(transaction));
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error retrieving data", error });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { transid, userid } = req.params;
    const data = req.body;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });
    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id: transid,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Calculate balance changes
    // Calculate new balance
    const amount = Number(originalTransaction.amount);
    const oldBalanceChange = originalTransaction.type === "EXPENSE" ? -amount : amount;

    const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id: transid,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    return res.json({ success: true, data: serializeAmount(transaction) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Creating data", error });
  }
};
