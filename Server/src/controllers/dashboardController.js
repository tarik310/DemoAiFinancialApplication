import { db } from "../../lib/prisma.js";
import { serializeTransaction } from "./helperFunctions.js";

export const getUserAccounts = async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);
    return res.json(serializedAccounts);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error retrieving data", error });
  }
};
export const createAccount = async (req, res) => {
  try {
    const { userid } = req.params;
    const data = req.body;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });
    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      return res.status(404).json({ success: false, message: "Invalid balance amount" });
    }
    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);
    return res.json({ success: true, data: serializedAccount });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Creating data", error });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await db.user.findUnique({
      where: { clerkUserId: userid },
    });

    if (!user) return res.status(404).json({ message: "User wasn't found" });

    // Get all user transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });
    return res.json(transactions.map(serializeTransaction));
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error retrieving data", error });
  }
};
