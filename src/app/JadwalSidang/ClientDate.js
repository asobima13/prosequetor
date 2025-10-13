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

export default function ClientDate() {
  const todayIso = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD format in local timezone
  const [iso, setIso] = useState(() => {
    try {
      return localStorage.getItem("jadwal_selected") || todayIso;
    } catch (e) {
      return todayIso;
    }
  });

  useEffect(() => {
    function onChange(e) {
      if (e && e.detail && e.detail.iso) setIso(e.detail.iso);
    }
    window.addEventListener("jadwal:change", onChange);
    return () => window.removeEventListener("jadwal:change", onChange);
  }, []);

  return <span>{isoToDisplay(iso)}</span>;
}
