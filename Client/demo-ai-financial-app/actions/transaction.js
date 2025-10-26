"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Create Transaction
export async function createTransaction(data) {
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
      `${process.env.BACKEND_API_URL}transaction/${params.userid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );
    const jsonData = await res.json();
    if (isDemo) {
      revalidatePath("/demo/dashboard");
      revalidatePath(`/demo/account/${jsonData.data.accountId}`);
    } else {
      revalidatePath("/dashboard");
      revalidatePath(`/account/${jsonData.data.accountId}`);
    }

    return jsonData;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  let userID;

  const isDemo = (await cookies()).get("x-in-demo")?.value === "true";
  if (isDemo) {
    userID = process.env.DEMO_USER_ID;
  } else {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    userID = userId;
  }

  const params = { transid: id, userid: userID };
  const res = await fetch(
    `${process.env.BACKEND_API_URL}transaction/${params.transid}/${params.userid}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );
  const jsonData = await res.json();
  return jsonData;
}

export async function updateTransaction(id, data) {
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

    const params = { transid: id, userid: userID };
    const res = await fetch(
      `${process.env.BACKEND_API_URL}transaction/${params.transid}/${params.userid}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );
    const jsonData = await res.json();
    if (isDemo) {
      revalidatePath("/demo/dashboard");
      revalidatePath(`/demo/account/${data.accountId}`);
    } else {
      revalidatePath("/dashboard");
      revalidatePath(`/account/${data.accountId}`);
    }

    return jsonData;
  } catch (error) {
    throw new Error(error.message);
  }
}
