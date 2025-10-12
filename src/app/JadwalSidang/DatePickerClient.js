"use client";

import { useEffect, useState } from "react";

function isoToDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const mi = parseInt(m, 10) - 1;
  const mon = months[mi] || m;
  return `${parseInt(d, 10)} ${mon} ${y}`;
}

export default function DatePickerClient() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState(todayIso);

  const [pidResults, setPidResults] = useState([]);
  const [loadingPid, setLoadingPid] = useState(false);
  const [pidError, setPidError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  async function performSearch(iso) {
    setSearchPerformed(true);
    setPidResults([]);
    setPidError(null);
    setLoadingPid(true);
    try {
      try {
        localStorage.setItem("jadwal_selected", iso);
      } catch (e) {}
      try {
        window.dispatchEvent(
          new CustomEvent("jadwal:change", { detail: { iso } })
        );
      } catch (e) {}
      const [y, m, d] = iso.split("-");
      const res = await fetch("/api/sipp-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: `${d}/${m}/${y}` }),
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPidResults(data.rows || []);
    } catch (err) {
      setPidError(String(err));
    } finally {
      setLoadingPid(false);
    }
  }

  useEffect(() => {
    performSearch(selected);
  }, []);

  return (
    <section className="section">
      <h2>Tanggal {isoToDisplay(selected)}</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ color: "#cfe8ea" }} htmlFor="search-date">
          Tanggal
        </label>
        <input
          id="search-date"
          type="date"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ background: "#0b0b0b", color: "#e6eef2" }}
        />
        <button className="cta" onClick={() => performSearch(selected)}>
          Cari
        </button>
        <button
          className="cta"
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            setSelected(today);
            performSearch(today);
          }}
        >
          Hari ini
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {!searchPerformed ? (
          <p style={{ color: "#9aa0a6" }}>
            Silakan pilih tanggal dan klik "Cari".
          </p>
        ) : loadingPid ? (
          <p style={{ color: "#9aa0a6" }}>Loading...</p>
        ) : pidError ? (
          <p style={{ color: "#f88" }}>Error: {pidError}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    No.
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Nomor Perkara
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Terdakwa
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Agenda
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Jaksa
                  </th>
                </tr>
              </thead>
              <tbody>
                {pidResults.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td style={{ padding: "10px 12px" }}>{i + 1}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.nomor || (r.raw && r.raw[2]) || ""}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.defendant || "Nama Terdakwa"}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.agenda || (r.raw && r.raw[5]) || ""}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.jaksa || "Nama Jaksa"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
