import "dotenv/config";
import express from "express";
import cors from "cors";

import { helmetConfig, apiLimiter, sanitizeInput } from "./middleware/security.js";
import authRoutes from "./routes/auth.routes.js";
import memoriesRoutes from "./routes/memories.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.use(helmetConfig);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(sanitizeInput);

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Between Us API ♥", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/memories", memoriesRoutes);
app.use("/api/user", userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "Unexpected file field" });
  }
  
  res.status(500).json({ 
    message: isProduction ? "Internal server error" : err.message 
  });
});

app.listen(PORT, () => {
  console.log(`\n  ♥ Between Us Backend running`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Environment: ${isProduction ? "production" : "development"}\n`);
});
