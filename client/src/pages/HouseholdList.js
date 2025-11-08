import React, { useState, useEffect } from "react";

const API = `${process.env.REACT_APP_API_URL}/api`;

export default function HouseholdList({ token }) {
  const [households, setHouseholds] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ message: "", type: "" });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: "" });
  const [editModal, setEditModal] = useState({ open: false, data: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 3000);
  };

  const fetchHouseholds = () => {
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
  };

  useEffect(() => {
    fetchHouseholds();
  }, [status, token]);

  // === Approve / Reject ===
  const updateStatus = async (id, newStatus, reason = "") => {
    try {
      const res = await fetch(`${API}/households/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registration_status: newStatus, rejection_reason: reason }),
      });
      if (res.ok) {
        showPopup(newStatus === "Approved" ? "✅ Approved!" : "🚫 Rejected.", "success");
        fetchHouseholds();
      } else {
        const data = await res.json();
        showPopup(data.error || "⚠️ Action failed.", "error");
      }
    } catch {
      showPopup("⚠️ Network error.", "error");
    }
  };

  // === Edit ===
  const saveEdit = async () => {
    try {
      const res = await fetch(`${API}/households/${editModal.data.household_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editModal.data),
      });
      if (res.ok) {
        showPopup("✅ Household updated successfully!", "success");
        setEditModal({ open: false, data: {} });
        fetchHouseholds();
      } else {
        showPopup("⚠️ Update failed.", "error");
      }
    } catch {
      showPopup("⚠️ Network error.", "error");
    }
  };

  // === Delete ===
  const deleteHousehold = async (id) => {
    try {
      const res = await fetch(`${API}/households/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showPopup("🗑️ Household deleted.", "success");
        fetchHouseholds();
      } else {
        showPopup("⚠️ Delete failed.", "error");
      }
    } catch {
      showPopup("⚠️ Network error.", "error");
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: "1100px", margin: "auto" }}>
      {popup.message && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: popup.type === "success" ? "#27ae60" : "#e74c3c",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            zIndex: 9999,
          }}
        >
          {popup.message}
        </div>
      )}

      <h2 className="form-title">📋 Household Submissions</h2>

      {/* Status Filter */}
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

      {/* Table */}
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
                <th style={{ padding: "10px 12px" }}>Actions</th>
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
                  }}
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

                  <td style={{ padding: "10px 12px" }}>
                    {status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(h.household_id, "Approved")}
                          style={{
                            background: "#27ae60",
                            color: "#fff",
                            marginRight: "5px",
                            borderRadius: "6px",
                            border: "none",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setRejectModal({
                              open: true,
                              id: h.household_id,
                              reason: "",
                            })
                          }
                          style={{
                            background: "#e74c3c",
                            color: "#fff",
                            marginRight: "5px",
                            borderRadius: "6px",
                            border: "none",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setEditModal({ open: true, data: h })}
                      style={{
                        background: "#2980b9",
                        color: "#fff",
                        marginRight: "5px",
                        borderRadius: "6px",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({ open: true, id: h.household_id })
                      }
                      style={{
                        background: "#7f8c8d",
                        color: "#fff",
                        borderRadius: "6px",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <Modal
          title="Reject Household"
          onCancel={() => setRejectModal({ open: false, id: null, reason: "" })}
          onConfirm={() => {
            updateStatus(rejectModal.id, "Rejected", rejectModal.reason);
            setRejectModal({ open: false, id: null, reason: "" });
          }}
        >
          <textarea
            rows="3"
            placeholder="Enter rejection reason..."
            value={rejectModal.reason}
            onChange={(e) =>
              setRejectModal({ ...rejectModal, reason: e.target.value })
            }
            style={{
              width: "100%",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              padding: "8px",
              resize: "none",
            }}
          ></textarea>
        </Modal>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <Modal
          title="Edit Household"
          onCancel={() => setEditModal({ open: false, data: {} })}
          onConfirm={saveEdit}
        >
          <label>Head of Household</label>
          <input
            value={editModal.data.head_name || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, head_name: e.target.value },
              })
            }
          />

          <label>Primary Phone</label>
          <input
            value={editModal.data.primary_phone || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, primary_phone: e.target.value },
              })
            }
          />

          <label>Alternate Contact</label>
          <input
            value={editModal.data.alternate_contact || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, alternate_contact: e.target.value },
              })
            }
          />

          <label>GPS Latitude</label>
          <input
            value={editModal.data.gps_latitude || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, gps_latitude: e.target.value },
              })
            }
          />

          <label>GPS Longitude</label>
          <input
            value={editModal.data.gps_longitude || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, gps_longitude: e.target.value },
              })
            }
          />

          <label>Land Size (acres)</label>
          <input
            type="number"
            value={editModal.data.land_size || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, land_size: e.target.value },
              })
            }
          />

          <label>Plot Characteristics</label>
          <select
            value={editModal.data.plot_characteristics || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, plot_characteristics: e.target.value },
              })
            }
          >
            <option value="">Select</option>
            <option>Flat Land</option>
            <option>Gentle Slope</option>
            <option>Steep Slope</option>
            <option>Valley / Wetland Edge</option>
            <option>Rocky Terrain</option>
            <option>Clay Soil</option>
            <option>Sandy Soil</option>
            <option>Loam Soil</option>
          </select>

          <label>Household Members</label>
          <input
            type="number"
            value={editModal.data.num_members || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, num_members: e.target.value },
              })
            }
          />

          <label>Primary Income</label>
          <select
            value={editModal.data.primary_income || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, primary_income: e.target.value },
              })
            }
          >
            <option value="">Select income source</option>
            <option>Crop Farming</option>
            <option>Livestock</option>
            <option>Trade / Business</option>
            <option>Salaried Employment</option>
            <option>Casual Labour</option>
            <option>Remittances</option>
            <option>Other</option>
          </select>

          <label>Water Source</label>
          <select
            value={editModal.data.water_source || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, water_source: e.target.value },
              })
            }
          >
            <option value="">Select water source</option>
            <option>Borehole</option>
            <option>Well</option>
            <option>River / Stream</option>
            <option>Rainwater Harvesting</option>
            <option>Tap / Piped Water</option>
            <option>Community Tank</option>
            <option>Other</option>
          </select>

          <label>Payment Method</label>
          <select
            value={editModal.data.payment_method || ""}
            onChange={(e) =>
              setEditModal({
                ...editModal,
                data: { ...editModal.data, payment_method: e.target.value },
              })
            }
          >
            <option value="">Select</option>
            <option value="MobileMoney">Mobile Money</option>
            <option value="Bank">Bank</option>
          </select>

          {editModal.data.payment_method === "MobileMoney" && (
            <>
              <label>Mobile Money Number</label>
              <input
                value={editModal.data.mobile_money_number || ""}
                onChange={(e) =>
                  setEditModal({
                    ...editModal,
                    data: { ...editModal.data, mobile_money_number: e.target.value },
                  })
                }
              />
            </>
          )}

          {editModal.data.payment_method === "Bank" && (
            <>
              <label>Bank Name</label>
              <input
                value={editModal.data.bank_name || ""}
                onChange={(e) =>
                  setEditModal({
                    ...editModal,
                    data: { ...editModal.data, bank_name: e.target.value },
                  })
                }
              />

              <label>Account Number</label>
              <input
                value={editModal.data.bank_account_number || ""}
                onChange={(e) =>
                  setEditModal({
                    ...editModal,
                    data: { ...editModal.data, bank_account_number: e.target.value },
                  })
                }
              />
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

// Simple reusable modal component
function Modal({ title, children, onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--card-bg)",
          padding: "20px 25px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>{title}</h3>
        <div>{children}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <button className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
