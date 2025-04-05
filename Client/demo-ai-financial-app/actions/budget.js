"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
export async function getCurrentBudget(accountId) {
  try {
    let userID;

    const isDemo = (await headers()).get("x-in-demo");
    if (isDemo) {
      userID = process.env.DEMO_USER_ID;
    } else {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      userID = userId;
    }
    const params = { accid: accountId, userid: userID };
    const res = await fetch(
      `${process.env.BACKEND_API_URL}budget/${params.accid}/${params.userid}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const jsonData = await res.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    let userID;

    const isDemo = (await headers()).get("x-in-demo");
    if (isDemo) {
      userID = process.env.DEMO_USER_ID;
    } else {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      userID = userId;
    }
    const params = { userid: userID };
    const res = await fetch(`${process.env.BACKEND_API_URL}budget/${params.userid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
      cache: "no-store",
    });
    const jsonData = await res.json();
    if (isDemo) {
      revalidatePath("/demo/dashboard");
    } else {
      revalidatePath("/dashboard");
    }

    return jsonData;
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
