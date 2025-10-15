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

function isoToDDMMYYYY(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function ddmmyyyyToIso(ddmmyyyy) {
  if (!ddmmyyyy || !ddmmyyyy.match(/^\d{2}\/\d{2}\/\d{4}$/)) return null;
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function formatList(content, defaultText) {
  if (!content || JSON.stringify(content) === JSON.stringify(defaultText)) {
    return content;
  }

  if (typeof content === "string") {
    if (content.includes("Terdakwa")) {
      return (
        <ol style={{ margin: 0, paddingLeft: "20px" }}>
          <li>Disamarkan</li>
        </ol>
      );
    }
    // Parse string into items
    let items;
    if (/\d+\.\s/.test(content)) {
      items = content
        .split(/\d+\.\s/)
        .filter((item) => item.trim())
        .map((item) => item.trim());
    } else {
      items = content
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }
    return (
      <ol style={{ margin: 0, paddingLeft: "20px" }}>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ol>
    );
  } else if (Array.isArray(content)) {
    const items = content.map((item) => item.trim().replace(/^\d+\.\s*/, ""));
    return (
      <ol style={{ margin: 0, paddingLeft: "20px" }}>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ol>
    );
  } else {
    return content;
  }
}

export default function DatePickerClient() {
  const todayIso = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD format in local timezone
  const [selected, setSelected] = useState(todayIso);
  const [inputDate, setInputDate] = useState(isoToDDMMYYYY(todayIso));
  const [showCalendar, setShowCalendar] = useState(false);

  const [pidResults, setPidResults] = useState([]);
  const [loadingPid, setLoadingPid] = useState(false);
  const [pidError, setPidError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  function getCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);
    while (current <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  const selectedDate = new Date(selected);
  const calendarDays = getCalendarDays(
    selectedDate.getFullYear(),
    selectedDate.getMonth()
  );

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
      console.log("data.rows: ", data.rows);
    } catch (err) {
      setPidError(String(err));
    } finally {
      setLoadingPid(false);
    }
  }

  useEffect(() => {
    performSearch(selected);
  }, []);

  useEffect(() => {
    setInputDate(isoToDDMMYYYY(selected));
  }, [selected]);

  return (
    <section className="section" style={{ textAlign: "center" }}>
      <h3 style={{ opacity: "0.85" }}>Tanggal {isoToDisplay(selected)}</h3>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {/* <label style={{ color: "#cfe8ea" }}>
          Tanggal: {isoToDisplay(selected)}
        </label> */}
        <input
          type="text"
          value={inputDate}
          readOnly
          onClick={() => setShowCalendar(!showCalendar)}
          placeholder="DD/MM/YYYY"
          style={{
            background: "#0b0b0b",
            color: "#e6eef2",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #333",
            cursor: "pointer",
          }}
        />
        {/* <button className="cta" onClick={() => performSearch(selected)}>
          Cari
        </button> */}
        <button
          className="cta"
          onClick={() => {
            const today = new Date().toLocaleDateString("sv-SE");
            setSelected(today);
            performSearch(today);
          }}
        >
          Hari ini
        </button>
        <button
          className="cta"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowIso = tomorrow.toLocaleDateString("sv-SE");
            setSelected(tomorrowIso);
            performSearch(tomorrowIso);
          }}
        >
          Besok
        </button>
      </div>

      {showCalendar && (
        <div
          style={{
            marginTop: 16,
            background: "#0f0f0f",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 8,
            }}
          >
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  color: "#cfe8ea",
                  fontWeight: "bold",
                }}
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              const dayIso = `${day.getFullYear()}-${String(
                day.getMonth() + 1
              ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
              const isSelected = dayIso === selected;
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelected(dayIso);
                    setShowCalendar(false);
                    performSearch(dayIso);
                  }}
                  style={{
                    padding: 8,
                    background: isSelected
                      ? "#2fd4d7"
                      : isCurrentMonth
                      ? "#1a1a1a"
                      : "#0b0b0b",
                    color: isSelected ? "#021214" : "#e6eef2",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    opacity: isCurrentMonth ? 1 : 0.5,
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 25 }}>
        {!searchPerformed ? (
          <p style={{ color: "#9aa0a6" }}>Silahkan pilih tanggal</p>
        ) : loadingPid ? (
          <p style={{ color: "#9aa0a6" }}>
            Mohon bersabar, konten sedang dimuat...
            <br />
            <br />
            "Sesungguhnya Allah beserta orang-orang yang sabar."
            <br />- QS. Al-Baqarah, Ayat 153 -
          </p>
        ) : pidError ? (
          <p style={{ color: "#f88" }}>Error: {pidError}</p>
        ) : pidResults.length === 0 ? (
          <p style={{ color: "#9aa0a6" }}>Tidak ada sidang</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    No.
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Nomor Perkara
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Klasifikasi Perkara
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Terdakwa
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "8px 12px",
                      color: "#cfe8ea",
                    }}
                  >
                    Agenda
                  </th>
                  <th
                    style={{
                      textAlign: "center",
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
                    // style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    style={{ borderTop: "1px solid lightGrey" }}
                  >
                    <td style={{ padding: "10px 12px" }}>{i + 1}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.nomor || (r.raw && r.raw[2]) || ""}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.klasifikasiPerkara || "Klasifikasi Perkara"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "left" }}>
                      {formatList(r.defendant, ["Nama Terdakwa"])}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.agenda || (r.raw && r.raw[5]) || ""}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "left" }}>
                      {formatList(r.jaksa, ["Nama Jaksa"])}
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
