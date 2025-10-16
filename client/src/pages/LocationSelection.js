import React, { useState, useEffect } from "react";
import "../styles/AppTheme.css";

const API = "http://localhost:5000/api/locations";

export default function LocationSelection({ token, onProceed }) {
  const [region, setRegion] = useState("");
  const [subregion, setSubregion] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entity, setEntity] = useState("");
  const [nextData, setNextData] = useState({});
  const [finalName, setFinalName] = useState("");
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [subregions, setSubregions] = useState([]);

  // Fetch Regions
  useEffect(() => {
    fetch(`${API}/regions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setRegions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  // Fetch Subregions when region changes
  useEffect(() => {
    if (!region) return;
    fetch(`${API}/subregions?region_id=${region}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSubregions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [region, token]);

  const entityTypes = ["District", "City", "Municipality", "TownCouncil"];

  const handleRegion = (e) => {
    setRegion(e.target.value);
    setSubregion("");
    setEntityType("");
    setEntity("");
    setNextData({});
    setFinalName("");
  };

  const handleEntityType = (e) => {
    setEntityType(e.target.value);
    setEntity("");
    setNextData({});
    setFinalName("");
  };

  const fetchEntities = async () => {
    if (!subregion || !entityType) return;
    setLoading(true);
    const res = await fetch(
      `${API}/entities?subregion_id=${subregion}&entity_type=${entityType}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setLoading(false);
    setNextData({ entities: data });
  };

  const loadNextLevel = async () => {
    setLoading(true);
    let res;
    if (entityType === "District") {
      res = await fetch(`${API}/subcounties?district_id=${entity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subcounties = await res.json();
      setNextData({ ...nextData, subcounties });
    }
    if (entityType === "City" || entityType === "Municipality") {
      res = await fetch(`${API}/divisions?district_id=${entity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const divisions = await res.json();
      setNextData({ ...nextData, divisions });
    }
    if (entityType === "TownCouncil") {
      res = await fetch(
        `${API}/wards?parent_id=${entity}&parent_type=TownCouncil`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const wards = await res.json();
      setNextData({ ...nextData, wards });
    }
    setLoading(false);
  };

  const confirm = () => {
    const selectedRegion =
      regions.find((r) => r.region_id === Number(region))?.name || "";
    const selectedSubregion =
      subregions.find((s) => s.subregion_id === Number(subregion))?.name || "";
    const selectedEntity =
      nextData.entities?.find(
        (e) => e.district_id === Number(entity) || e.id === Number(entity)
      )?.name || "";
    const selectedNextLevel =
      nextData.subcounties?.find((s) => s.subcounty_id === Number(entity))
        ?.name ||
      nextData.divisions?.find((d) => d.division_id === Number(entity))?.name ||
      nextData.wards?.find((w) => w.ward_id === Number(entity))?.name ||
      finalName;
    const breadcrumb = [
      selectedRegion,
      selectedSubregion,
      selectedEntity,
      selectedNextLevel,
    ]
      .filter(Boolean)
      .join(" → ");

    const context = {
      region_id: region,
      subregion_id: subregion,
      district_id: entityType === "District" ? entity : null,
      division_id:
        entityType === "City" || entityType === "Municipality" ? entity : null,
      ward_id: entityType === "TownCouncil" ? entity : null,
      finalName: selectedNextLevel,
      breadcrumb,
    };

    localStorage.setItem("locationContext", JSON.stringify(context));
    alert(`✅ Location set: ${breadcrumb}`);
    onProceed();
  };

  return (
    <div className="form-card">

      <h2 className="form-title">📍 Location Selection</h2>

      <label>Region *</label>
      <select value={region} onChange={handleRegion}>
        <option value="">Select Region</option>
        {regions.map((r) => (
          <option key={r.region_id} value={r.region_id}>
            {r.name}
          </option>
        ))}
      </select>

      {region && (
        <>
          <label>Subregion *</label>
          <select
            value={subregion}
            onChange={(e) => setSubregion(e.target.value)}
          >
            <option value="">Select Subregion</option>
            {subregions.map((s) => (
              <option key={s.subregion_id} value={s.subregion_id}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      )}

      {subregion && (
        <>
          <label>Entity Type *</label>
          <select value={entityType} onChange={handleEntityType}>
            <option value="">Select Entity Type</option>
            {entityTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </>
      )}

      {entityType && (
        <>
          <button className="secondary" onClick={fetchEntities}>
            {loading ? "Loading..." : `Load ${entityType}s`}
          </button>

          {nextData.entities && nextData.entities.length > 0 && (
            <>
              <label>{entityType} *</label>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
              >
                <option value="">Select {entityType}</option>
                {nextData.entities.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>

              <button className="secondary" onClick={loadNextLevel}>
                Continue to{" "}
                {entityType === "District"
                  ? "Subcounties"
                  : entityType === "TownCouncil"
                  ? "Wards"
                  : "Divisions"}
              </button>
            </>
          )}
        </>
      )}

      {nextData.subcounties && (
        <>
          <label>Subcounty *</label>
          <select
            onChange={(e) =>
              setFinalName(e.target.options[e.target.selectedIndex].text)
            }
          >
            <option value="">Select Subcounty</option>
            {nextData.subcounties.map((s) => (
              <option key={s.subcounty_id} value={s.subcounty_id}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      )}

      {nextData.divisions && (
        <>
          <label>Division *</label>
          <select
            onChange={(e) =>
              setFinalName(e.target.options[e.target.selectedIndex].text)
            }
          >
            <option value="">Select Division</option>
            {nextData.divisions.map((d) => (
              <option key={d.division_id} value={d.division_id}>
                {d.name}
              </option>
            ))}
          </select>
        </>
      )}

      {nextData.wards && (
        <>
          <label>Ward *</label>
          <select
            onChange={(e) =>
              setFinalName(e.target.options[e.target.selectedIndex].text)
            }
          >
            <option value="">Select Ward</option>
            {nextData.wards.map((w) => (
              <option key={w.ward_id} value={w.ward_id}>
                {w.name}
              </option>
            ))}
          </select>
        </>
      )}

      {finalName && (
        <button className="primary" onClick={confirm}>
          Register Households in {finalName}
        </button>
      )}
    </div>
  );
}
