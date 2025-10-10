import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

function HouseholdList({ token }) {
  const [households, setHouseholds] = useState([]);
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    fetch(`${API}/households?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setHouseholds)
      .catch(console.error);
  }, [status, token]);

  return (
    <div style={{ padding: 30 }}>
      <h2>📋 Household Submissions</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Pending</option>
        <option>Approved</option>
        <option>Rejected</option>
      </select>
      <table border="1" cellPadding="5" style={{ marginTop: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>ID</th><th>Head</th><th>Phone</th><th>Region</th><th>Land</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {households.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: "center" }}>No records</td></tr>
          ) : (
            households.map(h => (
              <tr key={h.household_id}>
                <td>{h.household_id}</td>
                <td>{h.head_name}</td>
                <td>{h.primary_phone}</td>
                <td>{h.region_name || h.region_id}</td>
                <td>{h.land_size}</td>
                <td>{h.registration_status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HouseholdList;
