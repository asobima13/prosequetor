import "./globals.css";

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l7 3v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RootPage() {
  return (
    <main className="hero">
      <div className="container layout">
        <section className="hero-left">
          <h1 className="brand">Prosequetor</h1>
          <p className="tag">Professional legal research & schedule helper</p>

          <p className="lead">
            Fast, privacy-first court schedule lookups. Use the date picker to
            fetch and view hearing schedules on demand.
          </p>

          <div className="cta-row">
            <a href="/JadwalSidang" className="btn primary">
              Cari Jadwal
            </a>
            <a href="#features" className="btn ghost">
              Pelajari
            </a>
          </div>

          <ul className="meta-list">
            <li>
              <IconClock /> <span>On-demand scraping</span>
            </li>
            <li>
              <IconShield /> <span>Minimal data retention</span>
            </li>
          </ul>
        </section>

        <aside className="hero-right">
          <div className="card highlight">
            <h4>Today's tool</h4>
            <p className="muted">
              Open the Schedule Search to fetch court sessions for a selected
              date.
            </p>
          </div>
        </aside>

        <section id="features" className="features">
          <div className="card">
            <h3>Schedule Search</h3>
            <p>
              Search PN Selong schedules with a simple date picker — results
              shown in a compact table.
            </p>
          </div>
          <div className="card">
            <h3>Lightweight Scraper</h3>
            <p>
              Server-side endpoint fetches only when requested; no periodic
              crawling.
            </p>
          </div>
          <div className="card">
            <h3>Privacy-focused</h3>
            <p>No tracking, no external analytics — just the tools you need.</p>
          </div>
        </section>

        <footer className="site-footer">
          <small>
            © {new Date().getFullYear()} Prosequetor — Built with focus on
            clarity and speed.
          </small>
        </footer>
      </div>
    </main>
  );
}
