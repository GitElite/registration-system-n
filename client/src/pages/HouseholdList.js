import React, { useState, useEffect } from "react";

const API = `${process.env.REACT_APP_API_URL}/api`;

function HouseholdList({ token }) {
  const [households, setHouseholds] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/households?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setHouseholds(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, token]);

  return (
    <div className="form-card" style={{ maxWidth: "1000px" }}>
      <h2 className="form-title">📋 Household Submissions</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <label style={{ fontWeight: 600, color: "var(--label)" }}>
          Filter by Status:
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
            fontSize: "14px",
          }}
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--label)" }}>Loading...</p>
      ) : households.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "var(--label)",
            fontStyle: "italic",
          }}
        >
          No household records found for <strong>{status}</strong>.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: "10px",
            border: "1px solid var(--btn-secondary-border)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "var(--card-bg)",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "10px 12px" }}>#</th>
                <th style={{ padding: "10px 12px" }}>Head</th>
                <th style={{ padding: "10px 12px" }}>Phone</th>
                <th style={{ padding: "10px 12px" }}>Region</th>
                <th style={{ padding: "10px 12px" }}>Land Size</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {households.map((h, index) => (
                <tr
                  key={h.household_id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background:
                      index % 2 === 0 ? "var(--bg)" : "var(--card-bg)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      index % 2 === 0 ? "var(--bg)" : "var(--card-bg)")
                  }
                >
                  <td style={{ padding: "10px 12px" }}>{h.household_id}</td>
                  <td style={{ padding: "10px 12px" }}>{h.head_name}</td>
                  <td style={{ padding: "10px 12px" }}>{h.primary_phone}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {h.region_name || h.region_id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{h.land_size}</td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontWeight: 600,
                      color:
                        h.registration_status === "Approved"
                          ? "green"
                          : h.registration_status === "Rejected"
                          ? "red"
                          : "orange",
                    }}
                  >
                    {h.registration_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HouseholdList;
