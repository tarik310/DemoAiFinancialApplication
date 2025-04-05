import { db } from "../../lib/prisma.js";

export const createUser = async (req, res) => {
  try {
    const data = req.body;
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: data.clerkUserId,
      },
    });

    if (loggedInUser) {
      return res.json(loggedInUser);
    }

    const newUser = await db.user.create({
      data,
    });
    return res.json(newUser);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error Creating data", error });
  }
};
