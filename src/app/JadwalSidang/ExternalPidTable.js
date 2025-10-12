import React from 'react'

export default function ExternalPidTable({ rows=[] }){
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nomor Perkara</th>
            <th>Tanggal</th>
            <th>Agenda</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=> (
            <tr key={i}>
              <td>{i+1}</td>
              <td>{r.nomor || (r.raw && r.raw[2])}</td>
              <td>{r.tanggal || (r.raw && r.raw[1])}</td>
              <td>{r.agenda || (r.raw && r.raw[5])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
import React from "react";

// Server component: fetches external SIPP page and extracts rows containing 'Pid' in the case number
export default async function ExternalPidTable({ datePath = "1/13/10/2025" }) {
  const url = `https://sipp.pn-selong.go.id/list_jadwal_sidang/search/${datePath}`;
  let html = "";
  try {
    const res = await fetch(url);
    html = await res.text();
  } catch (e) {
    return (
      <section className="section">
        <h3>External Pid Cases (temporary)</h3>
        <p style={{ color: "#f88" }}>
          Failed to fetch external schedule: {String(e)}
        </p>
      </section>
    );
  }

  // extract table rows
  const rowMatches = Array.from(
    html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)
  ).map((m) => m[1]);

  function stripTags(s) {
    return s
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  const parsed = rowMatches
    .map((r) => {
      const tds = Array.from(r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(
        (m) => stripTags(m[1])
      );
      return tds.length ? tds : null;
    })
    .filter(Boolean);

  // Filter rows where the Nomor Perkara (likely index 2) contains 'Pid'
  const pidRows = parsed.filter((cols) => cols[2] && /Pid/i.test(cols[2]));

  return (
    <section className="section" style={{ marginTop: 24 }}>
      <h3>External Pid Cases (temporary)</h3>
      {pidRows.length === 0 ? (
        <p style={{ color: "#9aa0a6" }}>
          No external Pid cases found for this date.
        </p>
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
                  No
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    color: "#cfe8ea",
                  }}
                >
                  Tanggal Sidang
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
                  Sidang Keliling
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    color: "#cfe8ea",
                  }}
                >
                  Ruangan
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
              </tr>
            </thead>
            <tbody>
              {pidRows.map((cols, i) => (
                <tr
                  key={i}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td style={{ padding: "10px 12px" }}>{cols[0] || i + 1}</td>
                  <td style={{ padding: "10px 12px" }}>{cols[1] || ""}</td>
                  <td style={{ padding: "10px 12px" }}>{cols[2] || ""}</td>
                  <td style={{ padding: "10px 12px" }}>{cols[3] || ""}</td>
                  <td style={{ padding: "10px 12px" }}>{cols[4] || ""}</td>
                  <td style={{ padding: "10px 12px" }}>{cols[5] || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
