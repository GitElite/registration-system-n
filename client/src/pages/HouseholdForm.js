import React, { useState } from "react";
import "../styles/AppTheme.css";
import { useEffect } from "react";

const API = `${process.env.REACT_APP_API_URL}/api/households`;

export default function HouseholdForm({ token }) {
  const locationContext = JSON.parse(localStorage.getItem("locationContext") || "{}");
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    head_name: "",
    primary_phone: "",
    alternate_contact: "",
    gps_latitude: "",
    gps_longitude: "",
    land_size: "",
    plot_characteristics: "",
    num_members: "",
    primary_income: "",
    past_orchard_experience: false,
    water_source: "",
    payment_method: "",
    mobile_money_number: "",
    bank_name: "",
    bank_account_number: "",
    agreed_to_credit_terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const errs = {};
    const phoneRegex = /^0[7349]\d{8}$/;
    if (!form.head_name.trim()) errs.head_name = "Head name is required.";
    if (!phoneRegex.test(form.primary_phone))
      errs.primary_phone = "Enter valid Ugandan phone (e.g. 0771234567).";
    if (form.alternate_contact && !phoneRegex.test(form.alternate_contact))
      errs.alternate_contact = "Alternate phone must be valid.";
    if (!form.gps_latitude || !form.gps_longitude)
      errs.gps_latitude = "GPS coordinates required.";
    if (isNaN(form.land_size) || form.land_size <= 0)
      errs.land_size = "Enter valid land size.";
    if (isNaN(form.num_members) || form.num_members < 1)
      errs.num_members = "Members must be at least 1.";
    if (!form.primary_income.trim())
      errs.primary_income = "Primary income required.";
    if (!form.water_source.trim())
      errs.water_source = "Water source required.";
    if (!form.payment_method)
      errs.payment_method = "Select payment method.";
    if (form.payment_method === "MobileMoney" && !phoneRegex.test(form.mobile_money_number))
      errs.mobile_money_number = "Enter valid Mobile Money number.";
    if (form.payment_method === "Bank") {
      if (!form.bank_name.trim()) errs.bank_name = "Bank name required.";
      if (!form.bank_account_number.trim()) errs.bank_account_number = "Account number required.";
    }
    if (!form.agreed_to_credit_terms)
      errs.agreed_to_credit_terms = "You must agree to credit terms.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMsg("");
      return;
    }

    const body = { ...form, ...locationContext };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Household registered successfully!");
        setErrors({});
        setForm({
          head_name: "",
          primary_phone: "",
          alternate_contact: "",
          gps_latitude: "",
          gps_longitude: "",
          land_size: "",
          plot_characteristics: "",
          num_members: "",
          primary_income: "",
          past_orchard_experience: false,
          water_source: "",
          payment_method: "",
          mobile_money_number: "",
          bank_name: "",
          bank_account_number: "",
          agreed_to_credit_terms: false,
        });
      } else setMsg(data.error || "Submission failed.");
    } catch {
      setMsg("⚠️ Network error. Try again later.");
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            gps_latitude: position.coords.latitude.toFixed(6),
            gps_longitude: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          console.warn("GPS access denied or unavailable:", error.message);
        }
      );
    } else {
      console.warn("Geolocation not supported on this device.");
    }
  }, []);


  return (
    <div className="form-card">

      <h2 className="form-title">🏠 Household Registration</h2>
      <p>
        <strong>📍 Location:</strong>{" "}
        {locationContext.breadcrumb || "No location selected"}
      </p>
      <hr className="divider" />
      {msg && <div className={msg.startsWith("✅") ? "success" : "warning"}>{msg}</div>}

      <form onSubmit={handleSubmit}>
        <label>Head of Household *</label>
        <input name="head_name" value={form.head_name} onChange={handleChange} />
        {errors.head_name && <small className="error">{errors.head_name}</small>}

        <label>Primary Phone *</label>
        <input name="primary_phone" value={form.primary_phone} onChange={handleChange} />
        {errors.primary_phone && <small className="error">{errors.primary_phone}</small>}

        <label>Alternate Contact</label>
        <input name="alternate_contact" value={form.alternate_contact} onChange={handleChange} />
        {errors.alternate_contact && <small className="error">{errors.alternate_contact}</small>}

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label>GPS Latitude *</label>
            <input name="gps_latitude" value={form.gps_latitude} onChange={handleChange} />
          </div>
          <div style={{ flex: 1 }}>
            <label>GPS Longitude *</label>
            <input name="gps_longitude" value={form.gps_longitude} onChange={handleChange} />
          </div>
        </div>
        {errors.gps_latitude && <small className="error">{errors.gps_latitude}</small>}

        <label>Land Size (acres) *</label>
        <input type="number" name="land_size" value={form.land_size} onChange={handleChange} />
        {errors.land_size && <small className="error">{errors.land_size}</small>}

        <label>Plot Characteristics *</label>
        <select
          name="plot_characteristics"
          value={form.plot_characteristics}
          onChange={handleChange}
        >
          <option value="">Select plot type</option>
          <option value="Flat Land">Flat Land</option>
          <option value="Gentle Slope">Gentle Slope</option>
          <option value="Steep Slope">Steep Slope</option>
          <option value="Valley / Wetland Edge">Valley / Wetland Edge</option>
          <option value="Rocky Terrain">Rocky Terrain</option>
          <option value="Clay Soil">Clay Soil</option>
          <option value="Sandy Soil">Sandy Soil</option>
          <option value="Loam Soil">Loam Soil</option>
        </select>


        <label>Number of Household Members *</label>
        <input type="number" name="num_members" value={form.num_members} onChange={handleChange} />
        {errors.num_members && <small className="error">{errors.num_members}</small>}

        <label>Primary Income Source *</label>
        <input name="primary_income" value={form.primary_income} onChange={handleChange} />
        {errors.primary_income && <small className="error">{errors.primary_income}</small>}

        <div className="checkbox-row">
          <label>Has Past Orchard Experience</label>
          <input
            type="checkbox"
            name="past_orchard_experience"
            checked={form.past_orchard_experience}
            onChange={handleChange}
          />
        </div>


        <label>Water Source *</label>
        <input name="water_source" value={form.water_source} onChange={handleChange} />
        {errors.water_source && <small className="error">{errors.water_source}</small>}

        <label>Payment Method *</label>
        <select name="payment_method" value={form.payment_method} onChange={handleChange}>
          <option value="">Select</option>
          <option value="MobileMoney">Mobile Money</option>
          <option value="Bank">Bank</option>
        </select>
        {errors.payment_method && <small className="error">{errors.payment_method}</small>}

        {form.payment_method === "MobileMoney" && (
          <>
            <label>Mobile Money Number *</label>
            <input name="mobile_money_number" value={form.mobile_money_number} onChange={handleChange} />
            {errors.mobile_money_number && (
              <small className="error">{errors.mobile_money_number}</small>
            )}
          </>
        )}

        {form.payment_method === "Bank" && (
          <>
            <label>Bank Name *</label>
            <input name="bank_name" value={form.bank_name} onChange={handleChange} />
            {errors.bank_name && <small className="error">{errors.bank_name}</small>}

            <label>Account Number *</label>
            <input name="bank_account_number" value={form.bank_account_number} onChange={handleChange} />
            {errors.bank_account_number && (
              <small className="error">{errors.bank_account_number}</small>
            )}
          </>
        )}

        <div className="checkbox-row">
          <label>I agree to credit terms</label>
          <input
            type="checkbox"
            name="agreed_to_credit_terms"
            checked={form.agreed_to_credit_terms}
            onChange={handleChange}
          />
        </div>

        {errors.agreed_to_credit_terms && (
          <small className="error">{errors.agreed_to_credit_terms}</small>
        )}

        <button type="submit" className="primary" onClick={handleSubmit}>
          Submit Household
        </button>
      </form>
    </div>
  );
}
