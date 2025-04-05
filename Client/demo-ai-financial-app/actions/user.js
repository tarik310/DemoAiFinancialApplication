"use server";

export async function createUserIfNew(data) {
  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    const user = await res.json();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}
