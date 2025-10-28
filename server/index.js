import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import locationRoutes from "./routes/locationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "https://registration-system-n.vercel.app", // your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", householdRoutes);

app.get("/", (req, res) => {
  res.send("Registration System API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
