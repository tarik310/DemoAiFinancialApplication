"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getUserAccounts() {
  let userID;

  // const isDemo = (await headers()).get("x-in-demo");
  const isDemo = (await cookies()).get("x-in-demo")?.value === "true";
  if (isDemo) {
    userID = process.env.DEMO_USER_ID;
  } else {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    userID = userId;
  }
  try {
    const params = { userid: userID };
    const res = await fetch(
      `${process.env.BACKEND_API_URL}dashboard/${params.userid}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const jsonData = await res.json();
    return jsonData;
  } catch (error) {
    console.error(error.message);
  }
}

export async function createAccount(data) {
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
      `${process.env.BACKEND_API_URL}dashboard/${params.userid}`,
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
