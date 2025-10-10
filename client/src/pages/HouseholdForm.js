import React, { useState } from "react";

const API = "http://localhost:5000/api/households";

function HouseholdForm({ token }) {
  const locationContext = JSON.parse(localStorage.getItem("locationContext") || "{}");

  const [msg, setMsg] = useState("");
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
  };

  const validate = () => {
    if (!form.head_name.trim()) return "Head name is required.";
    if (!/^[0-9]{9,12}$/.test(form.primary_phone))
      return "Enter a valid phone number (9–12 digits).";
    if (!form.gps_latitude || !form.gps_longitude)
      return "GPS coordinates are required.";
    if (isNaN(form.land_size) || form.land_size <= 0)
      return "Enter a valid positive land size.";
    if (isNaN(form.num_members) || form.num_members < 1)
      return "Number of members must be at least 1.";
    if (!form.agreed_to_credit_terms)
      return "You must agree to credit terms before submitting.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return alert(error);

    const body = {
      ...form,
      region_id: locationContext.region_id,
      subregion_id: locationContext.subregion_id,
      district_id: locationContext.district_id,
      subcounty_id: locationContext.subcounty_id,
      parish_id: locationContext.parish_id,
      village_id: locationContext.village_id,
      division_id: locationContext.division_id || null,
      ward_id: locationContext.ward_id || null,
      cellzone_id: locationContext.cellzone_id || null,
    };

    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setMsg(data.message || data.error);

    if (data.message) {
      alert("✅ Household registered successfully!");
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
    }
  };

  const Label = ({ text, required, tip }) => (
    <label title={tip} style={{ fontWeight: "bold" }}>
      {text}
      {required && <span style={{ color: "red" }}> *</span>}
    </label>
  );

  return (
    <div style={{ padding: 30, fontFamily: "Arial", maxWidth: 650 }}>
      <h2>🏠 Household Registration</h2>
      <p>
        <strong>📍 Location:</strong>{" "}
        {locationContext.breadcrumb || "No location selected"}
      </p>
      <hr />

      <form onSubmit={handleSubmit}>
        <Label text="Head of Household" required /><br />
        <input name="head_name" value={form.head_name} onChange={handleChange} required /><br /><br />

        <Label text="Primary Phone" required /><br />
        <input name="primary_phone" value={form.primary_phone} onChange={handleChange} required /><br /><br />

        <Label text="Alternate Contact" /><br />
        <input name="alternate_contact" value={form.alternate_contact} onChange={handleChange} /><br /><br />

        <Label text="GPS Latitude" required /><br />
        <input name="gps_latitude" value={form.gps_latitude} onChange={handleChange} required /><br /><br />

        <Label text="GPS Longitude" required /><br />
        <input name="gps_longitude" value={form.gps_longitude} onChange={handleChange} required /><br /><br />

        <Label text="Land Size (acres)" required /><br />
        <input type="number" name="land_size" value={form.land_size} onChange={handleChange} required /><br /><br />

        <Label text="Plot Characteristics" /><br />
        <input name="plot_characteristics" value={form.plot_characteristics} onChange={handleChange} /><br /><br />

        <Label text="Number of Household Members" required /><br />
        <input type="number" name="num_members" value={form.num_members} onChange={handleChange} required /><br /><br />

        <Label text="Primary Income Source" /><br />
        <input name="primary_income" value={form.primary_income} onChange={handleChange} /><br /><br />

        <label>
          <input
            type="checkbox"
            name="past_orchard_experience"
            checked={form.past_orchard_experience}
            onChange={handleChange}
          />
          &nbsp;Has Past Orchard Experience
        </label><br /><br />

        <Label text="Water Source" /><br />
        <input name="water_source" value={form.water_source} onChange={handleChange} /><br /><br />

        <Label text="Payment Method" /><br />
        <select name="payment_method" value={form.payment_method} onChange={handleChange}>
          <option value="">Select</option>
          <option value="MobileMoney">Mobile Money</option>
          <option value="Bank">Bank</option>
        </select><br /><br />

        {form.payment_method === "MobileMoney" && (
          <>
            <Label text="Mobile Money Number" /><br />
            <input name="mobile_money_number" value={form.mobile_money_number} onChange={handleChange}/><br /><br />
          </>
        )}

        {form.payment_method === "Bank" && (
          <>
            <Label text="Bank Name" /><br />
            <input name="bank_name" value={form.bank_name} onChange={handleChange}/><br /><br />
            <Label text="Account Number" /><br />
            <input name="bank_account_number" value={form.bank_account_number} onChange={handleChange}/><br /><br />
          </>
        )}

        <label title="Must be checked before submission">
          <input
            type="checkbox"
            name="agreed_to_credit_terms"
            checked={form.agreed_to_credit_terms}
            onChange={handleChange}
            required
          />
          &nbsp;I agree to credit terms
        </label><br /><br />

        <button type="submit">Submit</button>
      </form>

      {msg && <p style={{ color: msg.includes("success") ? "green" : "red" }}>{msg}</p>}
    </div>
  );
}

export default HouseholdForm;
