import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv/config";
import path from "path";

import mainRoutes from "./routes/index.js";

const app = express();

// Restrict CORS to specific origins
const corsConfig = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: "GET, POST, PATCH, DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

const PORT = process.env.PORT || 8001;

// Add request size limits
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(cors(corsConfig));

// Add security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

//router config
app.use("/", mainRoutes);

// front end serving
app.use(express.static(path.join("client/dist")));
app.use("*", (req, res) =>
  res.sendFile(path.resolve("client/dist/index.html"))
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.name, err.message);
  res.status(500).json({
    message: "Internal server error",
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('Starting graceful shutdown');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close after 10s if still running
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}
