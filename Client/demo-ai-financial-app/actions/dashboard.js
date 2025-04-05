"use server";

import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getUserAccounts() {
  let userID;

  const isDemo = (await headers()).get("x-in-demo");
  if (isDemo) {
    userID = process.env.DEMO_USER_ID;
  } else {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    userID = userId;
  }
  try {
    const params = { userid: userID };
    const res = await fetch(`${process.env.BACKEND_API_URL}dashboard/${params.userid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const jsonData = await res.json();
    return jsonData;
  } catch (error) {
    console.error(error.message);
  }
}

export async function createAccount(data) {
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
    const res = await fetch(`${process.env.BACKEND_API_URL}dashboard/${params.userid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
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
  const res = await fetch(
    `${process.env.BACKEND_API_URL}dashboard/alldata/${params.userid}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );
  const jsonData = await res.json();
  return jsonData;
}
