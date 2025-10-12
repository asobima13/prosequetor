import React from "react";
import ClientDate from "./ClientDate";
import DatePickerClient from "./DatePickerClient";

export const metadata = {
  title: "Prosequetor",
};

export default function Page() {
  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1>Jadwal Sidang Jaksa</h1>
        <p style={{ opacity: 0.85 }}>di Pengadilan Negeri Selong</p>
      </div>
      <DatePickerClient />
    </main>
  );
}
