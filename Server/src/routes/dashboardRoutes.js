import { Router } from "express";
import {
  getUserAccounts,
  createAccount,
  getDashboardData,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/:userid", getUserAccounts);
router.get("/alldata/:userid", getDashboardData);
router.post("/:userid", createAccount);

export default router;
