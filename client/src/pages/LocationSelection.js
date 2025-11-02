import React, { useState, useEffect } from "react";
import "../styles/AppTheme.css";

const API = `${process.env.REACT_APP_API_URL}/api/locations`;

export default function LocationSelection({ token, onProceed }) {
  const [region, setRegion] = useState("");
  const [subregion, setSubregion] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entity, setEntity] = useState("");
  const [nextData, setNextData] = useState({});
  const [finalName, setFinalName] = useState("");
  const [regions, setRegions] = useState([]);
  const [subregions, setSubregions] = useState([]);
  const [entities, setEntities] = useState([]);

  // ✅ Load regions
  useEffect(() => {
    fetch(`${API}/regions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setRegions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  // ✅ Load subregions when region changes
  useEffect(() => {
    if (!region) return;
    fetch(`${API}/subregions?region_id=${region}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSubregions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [region, token]);

  // ✅ Load entities automatically when subregion + type selected
  useEffect(() => {
    if (!subregion || !entityType) return;
    fetch(`${API}/entities?subregion_id=${subregion}&entity_type=${entityType}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setEntities(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [subregion, entityType, token]);

  // ✅ Load next level automatically when entity is chosen
  useEffect(() => {
    if (!entity || !entityType) return;
    const fetchNextLevel = async () => {
      let res, data;
      if (entityType === "District") {
        res = await fetch(`${API}/subcounties?district_id=${entity}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await res.json();
        setNextData({ subcounties: data });
      } else if (entityType === "City" || entityType === "Municipality") {
        res = await fetch(`${API}/divisions?district_id=${entity}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await res.json();
        setNextData({ divisions: data });
      } else if (entityType === "TownCouncil") {
        res = await fetch(
          `${API}/wards?parent_id=${entity}&parent_type=TownCouncil`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = await res.json();
        setNextData({ wards: data });
      }
    };
    fetchNextLevel();
  }, [entity, entityType, token]);

  // ✅ Confirm selection
  const confirm = () => {
    const selectedRegion = regions.find((r) => r.region_id == region)?.name;
    const selectedSubregion = subregions.find((s) => s.subregion_id == subregion)?.name;
    const selectedEntity = entities.find((e) => e.id == entity || e.district_id == entity)?.name;
    const selectedNextLevel =
      nextData.subcounties?.find((s) => s.subcounty_id == entity)?.name ||
      nextData.divisions?.find((d) => d.division_id == entity)?.name ||
      nextData.wards?.find((w) => w.ward_id == entity)?.name ||
      finalName;

    const breadcrumb = [selectedRegion, selectedSubregion, selectedEntity, selectedNextLevel]
      .filter(Boolean)
      .join(" → ");

    localStorage.setItem(
      "locationContext",
      JSON.stringify({
        region_id: region,
        subregion_id: subregion,
        district_id: entityType === "District" ? entity : null,
        division_id:
          entityType === "City" || entityType === "Municipality" ? entity : null,
        ward_id: entityType === "TownCouncil" ? entity : null,
        finalName: selectedNextLevel,
        breadcrumb,
      })
    );

    alert(`✅ Location set: ${breadcrumb}`);
    onProceed();
  };

  return (
    <div className="form-card">
      <h2 className="form-title">📍 Location Selection</h2>

      {/* REGION */}
      <label>Region *</label>
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
        <option value="">Select Region</option>
        {regions.map((r) => (
          <option key={r.region_id} value={r.region_id}>{r.name}</option>
        ))}
      </select>

      {/* SUBREGION */}
      {region && (
        <>
          <label>Subregion *</label>
          <select value={subregion} onChange={(e) => setSubregion(e.target.value)}>
            <option value="">Select Subregion</option>
            {subregions.map((s) => (
              <option key={s.subregion_id} value={s.subregion_id}>{s.name}</option>
            ))}
          </select>
        </>
      )}

      {/* ENTITY TYPE */}
      {subregion && (
        <>
          <label>Entity Type *</label>
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
            <option value="">Select Entity Type</option>
            <option>District</option>
            <option>City</option>
            <option>Municipality</option>
            <option>TownCouncil</option>
          </select>
        </>
      )}

      {/* ENTITY */}
      {entities.length > 0 && (
        <>
          <label>{entityType} *</label>
          <select value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">Select {entityType}</option>
            {entities.map((x) => (
              <option key={x.id || x.district_id} value={x.id || x.district_id}>
                {x.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* NEXT LEVEL (auto populated) */}
      {nextData.subcounties && (
        <>
          <label>Subcounty *</label>
          <select onChange={(e) => setFinalName(e.target.options[e.target.selectedIndex].text)}>
            <option value="">Select Subcounty</option>
            {nextData.subcounties.map((s) => (
              <option key={s.subcounty_id} value={s.subcounty_id}>{s.name}</option>
            ))}
          </select>
        </>
      )}

      {nextData.divisions && (
        <>
          <label>Division *</label>
          <select onChange={(e) => setFinalName(e.target.options[e.target.selectedIndex].text)}>
            <option value="">Select Division</option>
            {nextData.divisions.map((d) => (
              <option key={d.division_id} value={d.division_id}>{d.name}</option>
            ))}
          </select>
        </>
      )}

      {nextData.wards && (
        <>
          <label>Ward *</label>
          <select onChange={(e) => setFinalName(e.target.options[e.target.selectedIndex].text)}>
            <option value="">Select Ward</option>
            {nextData.wards.map((w) => (
              <option key={w.ward_id} value={w.ward_id}>{w.name}</option>
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
