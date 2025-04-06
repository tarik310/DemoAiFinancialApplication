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

export const getAllUsers = async (req, res) => {
  try {
    const users = await db.user.findMany({
      include: {
        accounts: true,
      },
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userid } = req.params;
    const data = req.body;

    const updatedUser = await db.user.update({
      where: {
        id: userid,
      },
      data,
    });

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

export const updateAccountOfUser = async (req, res) => {
  try {
    const { accid } = req.params;
    const data = req.body;

    const updatedAccount = await db.account.update({
      where: {
        id: accid,
      },
      data,
    });

    return res.json(updatedAccount);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating account",
      error: error.message,
    });
  }
};
