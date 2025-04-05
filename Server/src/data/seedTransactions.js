import { subDays, addDays } from "date-fns";
import { db } from "../../lib/prisma.js";

const ACCOUNT_ID = "account-id";
const USER_ID = "user-id";

// Define income categories with realistic intervals
const INCOME_CATEGORIES = [
  { name: "salary", range: [4500, 6000], interval: [28, 32] }, // Monthly salary
  { name: "freelance", range: [500, 2000], interval: [25, 40] }, // Every 25-40 days
  { name: "investments", range: [100, 800], interval: [30, 40] },
  { name: "other-income", range: [50, 1000], interval: [20, 35] },
];

// Define expense categories with realistic intervals
const EXPENSE_CATEGORIES = [
  { name: "housing", range: [1000, 3000], interval: [28, 32] }, // Rent/mortgage (monthly)
  { name: "transportation", range: [20, 100], interval: [3, 7] }, // Gas or transit every few days
  { name: "groceries", range: [50, 150], interval: [6, 8] }, // Weekly groceries
  { name: "utilities", range: [150, 400], interval: [28, 32] }, // Monthly bills
  { name: "entertainment", range: [20, 100], interval: [7, 15] },
  { name: "food", range: [15, 50], interval: [7, 10] }, // Dining out roughly weekly
  { name: "shopping", range: [30, 200], interval: [20, 40] },
  { name: "healthcare", range: [20, 300], interval: [30, 90] },
  { name: "education", range: [50, 300], interval: [28, 32] },
  { name: "travel", range: [100, 800], interval: [90, 120] },
  { name: "other-expense", range: [10, 100], interval: [7, 14] },
];

// Helper to generate a random amount within a given range
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get a random number of days within the interval
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const seedTransactions = async (req, res) => {
  try {
    const transactions = [];
    let totalBalance = 0;

    const startDate = subDays(new Date(), 365);
    const endDate = new Date();

    // Generate transactions for income categories
    for (const category of INCOME_CATEGORIES) {
      let currentDate = startDate;
      while (currentDate <= endDate) {
        const amount = getRandomAmount(category.range[0], category.range[1]);
        const transaction = {
          id: crypto.randomUUID(),
          type: "INCOME",
          amount,
          description: `Received ${category.name}`,
          date: currentDate,
          category: category.name,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: currentDate,
          updatedAt: currentDate,
        };

        totalBalance += amount;
        transactions.push(transaction);

        // Advance currentDate by a random interval (in days)
        const daysToAdd = getRandomInterval(category.interval[0], category.interval[1]);
        currentDate = addDays(currentDate, daysToAdd);
      }
    }

    // Generate transactions for expense categories
    for (const category of EXPENSE_CATEGORIES) {
      let currentDate = startDate;
      while (currentDate <= endDate) {
        const amount = getRandomAmount(category.range[0], category.range[1]);
        const transaction = {
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount,
          description: `Paid for ${category.name}`,
          date: currentDate,
          category: category.name,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: currentDate,
          updatedAt: currentDate,
        };

        totalBalance -= amount;
        transactions.push(transaction);

        // Advance currentDate by a random interval (in days)
        const daysToAdd = getRandomInterval(category.interval[0], category.interval[1]);
        currentDate = addDays(currentDate, daysToAdd);
      }
    }

    // Insert transactions in a transaction and update account balance
    await db.$transaction(async (tx) => {
      // Remove existing transactions for this account
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert newly generated transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });
    return res.json({
      success: true,
      message: `Created ${transactions.length} transactions`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Creating data", error });
  }
};
