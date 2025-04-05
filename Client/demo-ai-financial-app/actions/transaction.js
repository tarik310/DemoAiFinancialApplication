"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { headers } from "next/headers";

// Create Transaction
export async function createTransaction(data) {
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

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userID,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
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

  const isDemo = (await headers()).get("x-in-demo");
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

    const isDemo = (await headers()).get("x-in-demo");
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
