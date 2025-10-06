import express from "express";
import pool from "../db.js";

const router = express.Router();

// 1. Get all Regions
router.get("/regions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM region ORDER BY region_id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Subregions by Region ID
router.get("/subregions", async (req, res) => {
  try {
    const { region_id } = req.query;
    const result = await pool.query(
      "SELECT * FROM subregion WHERE region_id = $1 ORDER BY subregion_id",
      [region_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Districts by Subregion
router.get("/districts", async (req, res) => {
  try {
    const { subregion_id } = req.query;
    const result = await pool.query(
      "SELECT * FROM district WHERE subregion_id = $1 ORDER BY district_id",
      [subregion_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Subcounties by District
router.get("/subcounties", async (req, res) => {
  try {
    const { district_id } = req.query;
    const result = await pool.query(
      "SELECT * FROM subcounty WHERE district_id = $1 ORDER BY subcounty_id",
      [district_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Parishes by Subcounty
router.get("/parishes", async (req, res) => {
  try {
    const { subcounty_id } = req.query;
    const result = await pool.query(
      "SELECT * FROM parish WHERE subcounty_id = $1 ORDER BY parish_id",
      [subcounty_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Villages by Parish
router.get("/villages", async (req, res) => {
  try {
    const { parish_id } = req.query;
    const result = await pool.query(
      "SELECT * FROM village WHERE parish_id = $1 ORDER BY village_id",
      [parish_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
