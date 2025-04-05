import { Router } from "express";
import { seedTransactions } from "../data/seedTransactions.js";
const router = Router();

router.get("/", seedTransactions);

export default router;
