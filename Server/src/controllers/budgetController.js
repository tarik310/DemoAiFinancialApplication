import { db } from "../../lib/prisma.js";

export const getCurrentBudget = async (req, res) => {
  try {
    const { accid, userid } = req.params;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });
    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId: accid,
      },
      _sum: {
        amount: true,
      },
    });
    return res.json({
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenses._sum.amount ? expenses._sum.amount.toNumber() : 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error retrieving data", error });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { userid } = req.params;
    const { amount } = req.body;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });
    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });
    return res.json({
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Updating data", error });
  }
};
