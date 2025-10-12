"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // lock scroll when menu open
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link href="/" className="nav-brand">
          ProseQuetor
        </Link>

        <nav className="nav-links" aria-hidden={open ? "false" : "true"}>
          <Link href="/">Beranda</Link>
          <Link href="/JadwalSidang">Jadwal Sidang</Link>
          <Link href="/contact">Kontak</Link>
        </nav>

        <button
          className={`hamburger ${open ? "is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>

      <div
        className={`mobile-menu ${open ? "open" : ""}`}
        role="menu"
        aria-hidden={!open}
      >
        <Link href="/" onClick={() => setOpen(false)}>
          Home
        </Link>
        <Link href="/JadwalSidang" onClick={() => setOpen(false)}>
          Jadwal Sidang
        </Link>
        <Link href="/contact" onClick={() => setOpen(false)}>
          Contact
        </Link>
      </div>
    </header>
  );
}
