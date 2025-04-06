import { Router } from "express";
import {
  updateAccountOfUser,
  getAllUsers,
  updateUser,
  createUser,
} from "../controllers/userController.js";

const router = Router();
router.get("/alluser", getAllUsers);
router.patch("/:userid", updateUser);
router.patch("/updateaccount/:accid", updateAccountOfUser);
router.post("/", createUser);

export default router;
