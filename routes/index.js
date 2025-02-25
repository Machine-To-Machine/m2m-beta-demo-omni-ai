import express from "express";
import { getStockData, testFunc } from "../controller/stock.js";
import { apiForChat, getChatAnswer } from "../controller/openai.js";
import { verifyToken } from "../middleware/vc.js";

const router = express.Router();

// Add basic request validation middleware
const validateRequest = (schema) => (req, res, next) => {
  try {
    if (schema && typeof schema === 'function') {
      const result = schema(req.body);
      if (result.error) {
        return res.status(400).json({ message: "Invalid request data", details: result.error });
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Request validation error" });
  }
};

router.post("/test", validateRequest(), testFunc);
router.post("/stock", validateRequest(), getStockData);
router.post("/chat", validateRequest(), apiForChat);

// Add GET health endpoint
router.get("/health", (req, res) => res.status(200).send({ status: "OK" }));

export default router;