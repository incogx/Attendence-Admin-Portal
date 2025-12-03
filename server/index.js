// server/index.js
// Pure ESM version — works with Node >=18

// ------------------------------------------------------
// 1) Load environment variables BEFORE any imports use them
// ------------------------------------------------------
import dotenv from "dotenv";
dotenv.config({ path: './.env' });

// ------------------------------------------------------
// 2) Import dependencies
// ------------------------------------------------------
import express from "express";
import cors from "cors";

// ------------------------------------------------------
// 3) Initialize Express App
// ------------------------------------------------------
const app = express();

// JSON body parser
app.use(express.json());

// CORS (allow Vite front-end)
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// ------------------------------------------------------
// 4) Dynamic import admin routes AFTER dotenv has loaded
// ------------------------------------------------------
let adminRoutes;
try {
  const module = await import("./adminRoutes.js");
  adminRoutes = module.default;
} catch (err) {
  console.error("❌ Failed to load adminRoutes.js:", err);
  process.exit(1);
}

// Mount routes under /api
app.use("/api", adminRoutes);

// ------------------------------------------------------
// 5) Start server
// ------------------------------------------------------
const PORT = process.env.PORT || 4001;
app.listen(PORT, () =>
  console.log(`🚀 Admin server running at http://localhost:${PORT}`)
);
