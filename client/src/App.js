import React, { useState } from "react";
import HouseholdForm from "./pages/HouseholdForm";
import HouseholdList from "./pages/HouseholdList";
import LocationSelection from "./pages/LocationSelection";
import ThemeToggle from "./components/ThemeToggle";

const API = "http://localhost:5000/api/auth";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [view, setView] = useState("location");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? `${API}/login` : `${API}/register`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ======== LOGIN / REGISTER VIEW ========
if (!token)
  return (
    <div
      className="form-card"
      style={{
        maxWidth: "420px",
        margin: "80px auto",
        padding: "30px 36px",
        textAlign: "center",
      }}
    >
      <h2
        className="form-title"
        style={{
          fontSize: "22px",
          marginBottom: "18px",
          borderBottom: "none",
          color: "var(--accent)",
        }}
      >
        {isLogin ? "Welcome Back 👋" : "Create Account"}
      </h2>

      {msg && (
        <div
          style={{
            color: msg.startsWith("✅") ? "green" : "red",
            marginBottom: "10px",
            fontWeight: "500",
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
        {!isLogin && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Jane Doe"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </>
        )}

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="e.g. jane@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="primary"
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "10px 0",
            fontSize: "15px",
          }}
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <button
        className="secondary"
        style={{
          width: "100%",
          marginTop: "12px",
          fontSize: "14px",
          padding: "8px 0",
        }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Need an account? Create one" : "Already registered? Log in"}
      </button>

      <div
        style={{
          textAlign: "center",
          marginTop: "22px",
          fontSize: "12px",
          color: "var(--label)",
        }}
      >
        Powered by <strong>Orchard Links</strong>
      </div>
    </div>
);


  // ======== MAIN APP VIEW ========
  return (
    <div>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 40px",
          background: "var(--card-bg)",
          color: "var(--text)",
          borderBottom: "1px solid var(--btn-secondary-border)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          transition: "background 0.3s, color 0.3s",
        }}
      >
        <h3 style={{ color: "var(--accent)", margin: 0 }}>
          Orchard Links Registration
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="secondary" onClick={() => setView("location")}>
            📍 Location
          </button>
          <button className="secondary" onClick={() => setView("form")}>
            ➕ Register
          </button>
          <button className="secondary" onClick={() => setView("list")}>
            📋 View
          </button>
          <button className="secondary" onClick={logout}>
            🚪 Logout
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Page content */}
      <main style={{ padding: 20 }}>
        {view === "location" && (
          <LocationSelection token={token} onProceed={() => setView("form")} />
        )}
        {view === "form" && <HouseholdForm token={token} />}
        {view === "list" && <HouseholdList token={token} />}
      </main>
    </div>
  );
}

export default App;
