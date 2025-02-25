import axios from "axios";
import dotenv from "dotenv";
import { VerifiableCredential } from "@web5/credentials";
import { createMessages } from "../providers/openai.js";

// Move to configuration or environment variables
const VALID_SYMBOLS = ["TSLA", "AAPL", "GOOGL", "AMZN", "MSFT", "NFLX"];
const REQUEST_TIMEOUT = 15000; // 15 seconds

// DO NOT store credential data in source code - move to secure storage/env
// Instead use environment variables or a secure vault/key manager
export const apiForChat = async (req, res) => {
  try {
    const { question, vcStatus } = req.body;

    // Input validation
    if (!question || typeof question !== 'string') {
      return res.status(400).send({
        message: "Invalid question format",
      });
    }

    const lowerQuestion = question.toLowerCase();

    // Check for stock data requests
    if (lowerQuestion.includes("latest")) {
      let symbol = "TSLA"; // Default

      // Find mentioned symbol
      for (const sym of VALID_SYMBOLS) {
        if (lowerQuestion.includes(sym.toLowerCase())) {
          symbol = sym;
          break;
        }
      }

      try {
        const stock = await getStockData(symbol.toUpperCase(), vcStatus);

        // Verify credential if provided
        if (stock.vcJwt) {
          try {
            const vc = await VerifiableCredential.verify({
              vcJwt: stock.vcJwt,
            });

            if (!vc) {
              return res.status(401).send({
                message: "Machine verification failed: invalid credential",
              });
            }
          } catch (verificationError) {
            return res.status(401).send({
              message: "Machine verification failed: verification error",
            });
          }
        }

        return res.send({
          message: JSON.stringify(stock.data),
        });
      } catch (error) {
        return res.status(500).send({
          message: "Failed to fetch stock data",
        });
      }
    }
    // Check for financial data requests
    else if (
      lowerQuestion.includes("financial") ||
      lowerQuestion.includes("finance") ||
      lowerQuestion.includes("business")
    ) {
      try {
        const finance = await getFinancialData(question, vcStatus);

        // Verify credential if provided
        if (finance.vcJwt) {
          try {
            const vc = await VerifiableCredential.verify({
              vcJwt: finance.vcJwt,
            });

            if (!vc) {
              return res.status(401).send({
                message: "Machine verification failed: invalid credential",
              });
            }
          } catch (verificationError) {
            return res.status(401).send({
              message: "Machine verification failed: verification error",
            });
          }
        }

        return res.send({
          message: finance.data.answer,
        });
      } catch (error) {
        return res.status(500).send({
          message: "Failed to fetch financial data",
        });
      }
    }
    // Default to general chat
    else {
      try {
        const answer = await createMessages(question, "chat");
        return res.send({
          message: answer,
          data: null,
        });
      } catch (error) {
        return res.status(500).send({
          message: "Failed to generate chat response",
        });
      }
    }
  } catch (error) {
    console.error("API chat error:", error.name || "Unknown error");
    return res.status(500).send({
      message: "An unexpected error occurred",
    });
  }
};

// Extract these service functions to a separate services module in a future refactor
export const getStockData = async (symbol, vcStatus) => {
  try {
    const timestamp = new Date().getTime();

    const requestPayload = {
      vcJwt: vcStatus ? process.env.VC_JWT : null,
      timestamp: timestamp,
      info: {
        symbol: symbol,
        period1: parseInt((timestamp - 3600 * 24 * 30 * 1000) / 1000), // 30 days
        period2: parseInt(timestamp / 1000),
      },
    };

    // Add VC if required
    if (vcStatus && process.env.VC_JWT) {
      requestPayload.vcJwt = process.env.VC_JWT;
    }

    const config = {
      method: "post",
      url: process.env.SERVICE_URL + "/stock",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestPayload),
      timeout: REQUEST_TIMEOUT,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Stock service error:", error.name || "Unknown error");
    throw new Error("Failed to fetch stock data");
  }
};

export const getFinancialData = async (question, vcStatus) => {
  try {
    const timestamp = new Date().getTime();

    const requestPayload = {
      apiKey: process.env.DUMMY_API_KEY,
      timestamp: timestamp,
      info: {
        question: question,
      },
    };

    // Add VC if required
    if (vcStatus && process.env.VC_JWT) {
      requestPayload.vcJwt = process.env.VC_JWT;
    }

    const config = {
      method: "post",
      url: process.env.WHISPERER_URL + "/finance",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestPayload),
      timeout: REQUEST_TIMEOUT,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Financial data service error:", error.name || "Unknown error");
    throw new Error("Failed to fetch financial data");
  }
};
