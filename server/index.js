import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import locationRoutes from "./routes/locationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";

dotenv.config();
const app = express();

/* ✅ CORS setup — single unified block */
const allowedOrigins = [
  "http://localhost:3000",                  // local dev
  "https://registration-system-n.vercel.app" // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ✅ Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ Routes */
app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/households", householdRoutes);

/* ✅ Health check */
app.get("/", (req, res) => {
  res.json({ status: "✅ Registration System API running..." });
});

/* ✅ Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
