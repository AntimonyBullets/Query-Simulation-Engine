import { Router } from "express";
import { processQuery, explainQuery, validateQuery } from "../controllers/queryController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Secure all routes with authentication middleware
router.post("/query", authenticate, processQuery);
router.post("/explain", authenticate, explainQuery);
router.post("/validate", authenticate, validateQuery);

export default router;
