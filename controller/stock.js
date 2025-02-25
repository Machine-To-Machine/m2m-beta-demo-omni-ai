import axios from "axios";
import dotenv from "dotenv";
import { createMessages } from "../providers/openai.js";

const API = axios.create({
  baseURL: process.env.YAHOO_LINK,
  timeout: 10000 // Add reasonable timeout
});

export const testFunc = (req, res) => {
  try {
    const { name } = req.body;
    const safeName = name ? String(name).slice(0, 100) : "World"; // Sanitize input

    res.send({
      message: `Hello ${safeName}`,
    });
  } catch (error) {
    res.status(500).send({ message: "Error processing request" });
  }
};

export const getStockData = async (req, res) => {
  try {
    const { symbol, period1, period2 } = req.body;

    // Validate inputs
    if (!symbol || typeof symbol !== 'string' || symbol.length > 10) {
      return res.status(400).send({
        message: "Invalid symbol parameter",
      });
    }

    // Use provided periods or calculate default ones
    const safeSymbol = symbol.trim().toUpperCase();
    const safePeriod1 = period1 || Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const safePeriod2 = period2 || Math.floor(Date.now() / 1000);

    const response = await API.get(
      `${safeSymbol}?symbol=${safeSymbol}&period1=${safePeriod1}&period2=${safePeriod2}&interval=1d&events=history%7Csplit`
    );

    if (!response || !response.data) {
      return res.status(404).send({
        message: "No data found",
      });
    }

    return res.send({
      message: "Success",
      data: response.data,
    });
  } catch (error) {
    console.error("Stock data error:", error.name, error.message);
    return res.status(error.response?.status || 500).send({
      message: "Error fetching stock data",
    });
  }
};
