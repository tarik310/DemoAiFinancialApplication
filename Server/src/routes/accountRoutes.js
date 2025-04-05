import { Router } from "express";
import {
  getAccountWithTransactions,
  bulkDeleteTransactions,
  updateDefaultAccount,
} from "../controllers/accountController.js";

const router = Router();

router.get("/:accid/:userid", getAccountWithTransactions);
router.patch("/:accid/:userid", updateDefaultAccount);
router.post("/:userid", bulkDeleteTransactions);

export default router;
