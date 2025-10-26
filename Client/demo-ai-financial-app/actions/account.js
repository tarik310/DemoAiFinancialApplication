"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getAccountWithTransactions(accountId) {
  let userID;

  const isDemo = (await cookies()).get("x-in-demo")?.value === "true";
  if (isDemo) {
    userID = process.env.DEMO_USER_ID;
  } else {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    userID = userId;
  }
  const params = { accid: accountId, userid: userID };
  const res = await fetch(
    `${process.env.BACKEND_API_URL}account/${params.accid}/${params.userid}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );
  const jsonData = await res.json();
  return jsonData;
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    let userID;

    const isDemo = (await cookies()).get("x-in-demo")?.value === "true";
    if (isDemo) {
      userID = process.env.DEMO_USER_ID;
    } else {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      userID = userId;
    }

    const params = { userid: userID };
    const res = await fetch(
      `${process.env.BACKEND_API_URL}account/${params.userid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionIds,
        }),
        cache: "no-store",
      }
    );
    const jsonData = await res.json();
    if (isDemo) {
      revalidatePath("/demo/dashboard");
      revalidatePath("/demo/account/[id]");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/account/[id]");
    }

    return jsonData;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDefaultAccount(accountId) {
  try {
    let userID;

    const isDemo = (await cookies()).get("x-in-demo")?.value === "true";
    if (isDemo) {
      userID = process.env.DEMO_USER_ID;
    } else {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      userID = userId;
    }
    const params = { accid: accountId, userid: userID };
    const res = await fetch(
      `${process.env.BACKEND_API_URL}account/${params.accid}/${params.userid}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    const jsonData = await res.json();
    if (isDemo) {
      revalidatePath("/demo/dashboard");
    } else {
      revalidatePath("/dashboard");
    }

    return jsonData;
  } catch (error) {
    return { success: false, error: error.message };
  }
}
