import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1️⃣ Get all Regions
router.get("/regions", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM region ORDER BY region_id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Get Subregions by Region ID
router.get("/subregions", authenticateToken, async (req, res) => {
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

// 3️⃣ Get Districts by Subregion
router.get("/districts", authenticateToken, async (req, res) => {
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

// 4️⃣ Get Subcounties by District (Rural)
router.get("/subcounties", authenticateToken, async (req, res) => {
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

// 5️⃣ Get Parishes by Subcounty
router.get("/parishes", authenticateToken, async (req, res) => {
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

// 6️⃣ Get Villages by Parish
router.get("/villages", authenticateToken, async (req, res) => {
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

// 7️⃣ Get Entities by Subregion and Type
router.get("/entities", authenticateToken, async (req, res) => {
  try {
    const { subregion_id, entity_type } = req.query;

    if (!subregion_id || !entity_type) {
      return res
        .status(400)
        .json({ error: "Missing subregion_id or entity_type" });
    }

    let query;
    switch (entity_type) {
      case "District":
        query =
          "SELECT district_id AS id, name FROM district WHERE subregion_id=$1 AND type='Rural'";
        break;
      case "City":
        query =
          "SELECT district_id AS id, name FROM district WHERE subregion_id=$1 AND type='City'";
        break;
      case "Municipality":
        query =
          "SELECT district_id AS id, name FROM district WHERE subregion_id=$1 AND type='Municipality'";
        break;
      case "TownCouncil":
        query =
          "SELECT district_id AS id, name FROM district WHERE subregion_id=$1 AND type='TownCouncil'";
        break;
      default:
        return res.status(400).json({ error: "Invalid entity_type" });
    }

    const result = await pool.query(query, [subregion_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching entities:", err.message);
    res.status(500).json({ error: "Failed to fetch entities" });
  }
});

// 8️⃣ Get Divisions by District (for Cities/Municipalities)
router.get("/divisions", authenticateToken, async (req, res) => {
  try {
    const { district_id } = req.query;
    const result = await pool.query(
      "SELECT * FROM division WHERE district_id = $1 ORDER BY division_id",
      [district_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9️⃣ Get Wards by Parent (Division or TownCouncil)
router.get("/wards", authenticateToken, async (req, res) => {
  try {
    const { parent_id, parent_type } = req.query;
    const result = await pool.query(
      "SELECT * FROM ward WHERE parent_id = $1 AND parent_type = $2 ORDER BY ward_id",
      [parent_id, parent_type]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔟 Get Cellzones by Ward
router.get("/cellzones", authenticateToken, async (req, res) => {
  try {
    const { ward_id } = req.query;
    const result = await pool.query(
      "SELECT * FROM cellzone WHERE ward_id = $1 ORDER BY cellzone_id",
      [ward_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/locationRoutes.js
router.get("/parishes", async (req,res)=>{
  const { subcounty_id } = req.query;
  const result = await pool.query(
    "SELECT admin_unit_id AS parish_id, name FROM admin_unit_lc4 WHERE lc3_id=$1",
    [subcounty_id]
  );
  res.json(result.rows);
});

router.get("/villages", async (req,res)=>{
  const { parish_id } = req.query;
  const result = await pool.query(
    "SELECT admin_unit_id AS village_id, name FROM admin_unit_lc1 WHERE lc4_id=$1",
    [parish_id]
  );
  res.json(result.rows);
});


export default router;
