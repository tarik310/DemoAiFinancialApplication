import { Router } from "express";
import { getCurrentBudget, updateBudget } from "../controllers/budgetController.js";

const router = Router();

router.get("/:accid/:userid", getCurrentBudget);
router.patch("/:userid", updateBudget);

export default router;
