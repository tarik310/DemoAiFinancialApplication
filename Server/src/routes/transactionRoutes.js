import { Router } from "express";
import {
  createTransaction,
  getTransaction,
  updateTransaction,
} from "../controllers/transactionController.js";

const router = Router();

router.post("/:userid", createTransaction);
router.get("/:transid/:userid", getTransaction);
router.patch("/:transid/:userid", updateTransaction);
export default router;
