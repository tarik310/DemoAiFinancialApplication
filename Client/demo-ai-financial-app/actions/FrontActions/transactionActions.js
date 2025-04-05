// "use server";

// import { auth } from "@clerk/nextjs/server";
// import { db } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

// import aj from "@/lib/arcjet";
// import { request } from "@arcjet/next";
// import { headers } from "next/headers";

// const serializeAmount = (obj) => ({
//   ...obj,
//   amount: obj.amount.toNumber(),
// });

// // Create Transaction
// export async function createTransaction(data) {
//   try {
//     let userID;

//     const isDemo = (await headers()).get("x-in-demo");
//     if (isDemo) {
//       userID = process.env.DEMO_USER_ID;
//     } else {
//       const { userId } = await auth();
//       if (!userId) throw new Error("Unauthorized");
//       userID = userId;
//     }

//     // Get request data for ArcJet
//     const req = await request();

//     // Check rate limit
//     const decision = await aj.protect(req, {
//       userID,
//       requested: 1, // Specify how many tokens to consume
//     });

//     if (decision.isDenied()) {
//       if (decision.reason.isRateLimit()) {
//         const { remaining, reset } = decision.reason;
//         console.error({
//           code: "RATE_LIMIT_EXCEEDED",
//           details: {
//             remaining,
//             resetInSeconds: reset,
//           },
//         });

//         throw new Error("Too many requests. Please try again later.");
//       }

//       throw new Error("Request blocked");
//     }

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userID },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     const account = await db.account.findUnique({
//       where: {
//         id: data.accountId,
//         userId: user.id,
//       },
//     });

//     if (!account) {
//       throw new Error("Account not found");
//     }

//     // Calculate new balance
//     const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
//     const newBalance = account.balance.toNumber() + balanceChange;

//     // Create transaction and update account balance
//     const transaction = await db.$transaction(async (tx) => {
//       const newTransaction = await tx.transaction.create({
//         data: {
//           ...data,
//           userId: user.id,
//           nextRecurringDate:
//             data.isRecurring && data.recurringInterval
//               ? calculateNextRecurringDate(data.date, data.recurringInterval)
//               : null,
//         },
//       });

//       await tx.account.update({
//         where: { id: data.accountId },
//         data: { balance: newBalance },
//       });

//       return newTransaction;
//     });
//     if (isDemo) {
//       revalidatePath("/demo/dashboard");
//       revalidatePath(`/demo/account/${transaction.accountId}`);
//     } else {
//       revalidatePath("/dashboard");
//       revalidatePath(`/account/${transaction.accountId}`);
//     }

//     return { success: true, data: serializeAmount(transaction) };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

// export async function getTransaction(id) {
//   let userID;

//   const isDemo = (await headers()).get("x-in-demo");
//   if (isDemo) {
//     userID = process.env.DEMO_USER_ID;
//   } else {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");
//     userID = userId;
//   }

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userID },
//   });

//   if (!user) throw new Error("User not found");

//   const transaction = await db.transaction.findUnique({
//     where: {
//       id,
//       userId: user.id,
//     },
//   });

//   if (!transaction) throw new Error("Transaction not found");

//   return serializeAmount(transaction);
// }

// export async function updateTransaction(id, data) {
//   try {
//     let userID;

//     const isDemo = (await headers()).get("x-in-demo");
//     if (isDemo) {
//       userID = process.env.DEMO_USER_ID;
//     } else {
//       const { userId } = await auth();
//       if (!userId) throw new Error("Unauthorized");
//       userID = userId;
//     }

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userID },
//     });

//     if (!user) throw new Error("User not found");

//     // Get original transaction to calculate balance change
//     const originalTransaction = await db.transaction.findUnique({
//       where: {
//         id,
//         userId: user.id,
//       },
//       include: {
//         account: true,
//       },
//     });

//     if (!originalTransaction) throw new Error("Transaction not found");

//     // Calculate balance changes
//     const oldBalanceChange =
//       originalTransaction.type === "EXPENSE"
//         ? -originalTransaction.amount.toNumber()
//         : originalTransaction.amount.toNumber();

//     const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

//     const netBalanceChange = newBalanceChange - oldBalanceChange;

//     // Update transaction and account balance in a transaction
//     const transaction = await db.$transaction(async (tx) => {
//       const updated = await tx.transaction.update({
//         where: {
//           id,
//           userId: user.id,
//         },
//         data: {
//           ...data,
//           nextRecurringDate:
//             data.isRecurring && data.recurringInterval
//               ? calculateNextRecurringDate(data.date, data.recurringInterval)
//               : null,
//         },
//       });

//       // Update account balance
//       await tx.account.update({
//         where: { id: data.accountId },
//         data: {
//           balance: {
//             increment: netBalanceChange,
//           },
//         },
//       });

//       return updated;
//     });
//     if (isDemo) {
//       revalidatePath("/demo/dashboard");
//       revalidatePath(`/demo/account/${data.accountId}`);
//     } else {
//       revalidatePath("/dashboard");
//       revalidatePath(`/account/${data.accountId}`);
//     }

//     return { success: true, data: serializeAmount(transaction) };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

// // Get User Transactions
// export async function getUserTransactions(query = {}) {
//   try {
//     let userID;

//     const isDemo = (await headers()).get("x-in-demo");
//     if (isDemo) {
//       userID = process.env.DEMO_USER_ID;
//     } else {
//       const { userId } = await auth();
//       if (!userId) throw new Error("Unauthorized");
//       userID = userId;
//     }
//     const user = await db.user.findUnique({
//       where: { clerkUserId: userID },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     const transactions = await db.transaction.findMany({
//       where: {
//         userId: user.id,
//         ...query,
//       },
//       include: {
//         account: true,
//       },
//       orderBy: {
//         date: "desc",
//       },
//     });

//     return { success: true, data: transactions };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

// // Helper function to calculate next recurring date
// function calculateNextRecurringDate(startDate, interval) {
//   const date = new Date(startDate);

//   switch (interval) {
//     case "DAILY":
//       date.setDate(date.getDate() + 1);
//       break;
//     case "WEEKLY":
//       date.setDate(date.getDate() + 7);
//       break;
//     case "MONTHLY":
//       date.setMonth(date.getMonth() + 1);
//       break;
//     case "YEARLY":
//       date.setFullYear(date.getFullYear() + 1);
//       break;
//   }

//   return date;
// }
