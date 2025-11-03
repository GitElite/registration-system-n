import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import locationRoutes from "./routes/locationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";

dotenv.config();
const app = express();

/* ✅ CORS configuration (Render + Vercel compatible) */
const allowedOrigins = [
  "http://localhost:3000",                 // Local dev
  "https://registration-system-n.vercel.app" // Live frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// ✅ Apply global CORS and preflight handler
app.use(cors(corsOptions));
app.options("/*", cors(corsOptions));

/* ✅ Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ Routes */
app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/households", householdRoutes);

/* ✅ Health check */
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Registration System API running..." });
});

/* ✅ Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
