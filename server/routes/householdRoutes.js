import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// === Create Household ===
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      head_name,
      primary_phone,
      alternate_contact,
      region_id,
      subregion_id,
      district_id,
      subcounty_id,
      parish_id,
      village_id,
      gps_latitude,
      gps_longitude,
      land_size,
      plot_characteristics,
      num_members,
      primary_income,
      past_orchard_experience,
      water_source,
      payment_method,
      mobile_money_number,
      bank_name,
      bank_account_number,
      agreed_to_credit_terms
    } = req.body;

    // Insert household
    const result = await pool.query(
      `INSERT INTO household (
        head_name, primary_phone, alternate_contact, region_id, subregion_id,
        district_id, subcounty_id, parish_id, village_id, gps_latitude, gps_longitude,
        land_size, plot_characteristics, num_members, primary_income,
        past_orchard_experience, water_source, payment_method,
        mobile_money_number, bank_name, bank_account_number,
        agreed_to_credit_terms, registered_by
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
      ) RETURNING household_id`,
      [
        head_name,
        primary_phone,
        alternate_contact,
        region_id,
        subregion_id,
        district_id,
        subcounty_id,
        parish_id,
        village_id,
        gps_latitude,
        gps_longitude,
        land_size,
        plot_characteristics,
        num_members,
        primary_income,
        past_orchard_experience,
        water_source,
        payment_method,
        mobile_money_number,
        bank_name,
        bank_account_number,
        agreed_to_credit_terms,
        req.user.id
      ]
    );

    res.status(201).json({
      message: "Household registered successfully",
      household_id: result.rows[0].household_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Get Households by Status ===
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status
      ? "SELECT * FROM household WHERE registration_status=$1 ORDER BY household_id DESC"
      : "SELECT * FROM household ORDER BY household_id DESC";
    const params = status ? [status] : [];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Approve or Reject ===
// === Update Household (Edit) ===
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      head_name,
      primary_phone,
      alternate_contact,
      gps_latitude,
      gps_longitude,
      land_size,
      plot_characteristics,
      num_members,
      primary_income,
      past_orchard_experience,
      water_source,
      payment_method,
      mobile_money_number,
      bank_name,
      bank_account_number,
      agreed_to_credit_terms,
      registration_status,
      rejection_reason
    } = req.body;

    const result = await pool.query(
      `UPDATE household SET
        head_name = COALESCE($1, head_name),
        primary_phone = COALESCE($2, primary_phone),
        alternate_contact = COALESCE($3, alternate_contact),
        gps_latitude = COALESCE($4, gps_latitude),
        gps_longitude = COALESCE($5, gps_longitude),
        land_size = COALESCE($6, land_size),
        plot_characteristics = COALESCE($7, plot_characteristics),
        num_members = COALESCE($8, num_members),
        primary_income = COALESCE($9, primary_income),
        past_orchard_experience = COALESCE($10, past_orchard_experience),
        water_source = COALESCE($11, water_source),
        payment_method = COALESCE($12, payment_method),
        mobile_money_number = COALESCE($13, mobile_money_number),
        bank_name = COALESCE($14, bank_name),
        bank_account_number = COALESCE($15, bank_account_number),
        agreed_to_credit_terms = COALESCE($16, agreed_to_credit_terms),
        registration_status = COALESCE($17, registration_status),
        rejection_reason = COALESCE($18, rejection_reason)
      WHERE household_id = $19`,
      [
        head_name,
        primary_phone,
        alternate_contact,
        gps_latitude,
        gps_longitude,
        land_size,
        plot_characteristics,
        num_members,
        primary_income,
        past_orchard_experience,
        water_source,
        payment_method,
        mobile_money_number,
        bank_name,
        bank_account_number,
        agreed_to_credit_terms,
        registration_status,
        rejection_reason,
        id
      ]
    );

    res.json({ message: "✅ Household updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
