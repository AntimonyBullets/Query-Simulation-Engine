import { Router } from "express";
import { processQuery, explainQuery, validateQuery } from "../controllers/queryController.js";

const router = Router();

router.post("/query", processQuery);
router.post("/explain", explainQuery);
router.post("/validate", validateQuery);

export default router;
