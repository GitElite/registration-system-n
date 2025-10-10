import React, { useState } from "react";
import HouseholdForm from "./pages/HouseholdForm";
import HouseholdList from "./pages/HouseholdList";
import LocationSelection from "./pages/LocationSelection";

const API = "http://localhost:5000/api/auth";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [view, setView] = useState("location");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? `${API}/login` : `${API}/register`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(data.message || data.error);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    }
  };
  const logout = () => { localStorage.removeItem("token"); setToken(null); };

  if (!token)
    return (
      <div style={{ padding: 30 }}>
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>Full Name:</label><br/>
              <input name="full_name" onChange={handleChange} required/><br/><br/>
            </>
          )}
          <label>Email:</label><br/>
          <input type="email" name="email" onChange={handleChange} required/><br/><br/>
          <label>Password:</label><br/>
          <input type="password" name="password" onChange={handleChange} required/><br/><br/>
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <p>{msg}</p>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need account? Register" : "Have account? Login"}
        </button>
      </div>
    );

    return (
    <div>
      <div style={{ background: "#f0f0f0", padding: 10, display: "flex", justifyContent: "space-between" }}>
        <h3>Orchard Links Registration</h3>
        <div>
          <button onClick={() => setView("location")}>📍 Location</button>
          <button onClick={() => setView("form")}>➕ Register</button>
          <button onClick={() => setView("list")}>📋 View</button>
          <button onClick={logout}>🚪 Logout</button>
        </div>
      </div>
      {view === "location" && <LocationSelection token={token} onProceed={() => setView("form")} />}
      {view === "form" && <HouseholdForm token={token} />}
      {view === "list" && <HouseholdList token={token} />}
    </div>
  );
}

export default App;
