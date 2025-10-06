import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import locationRoutes from "./routes/locationRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", locationRoutes);

app.get("/", (req, res) => {
  res.send("Registration System API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
