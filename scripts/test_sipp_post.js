#!/usr/bin/env node
// Simple runner to exercise the scraper logic from src/app/api/sipp-search/route.js
// Usage: node scripts/test_sipp_post.js 13/10/2025

const date = process.argv[2] || "13/10/2025";

function stripTags(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function fetchHtml(url, opts) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal, ...opts });
    if (!res.ok) throw new Error(`fetch ${url} failed ${res.status}`);
    const text = await res.text();
    return text;
  } finally {
    clearTimeout(id);
  }
}

(async () => {
  try {
    const path = `1/${date}`;
    const url = `https://sipp.pn-selong.go.id/list_jadwal_sidang/search/${path}`;
    console.error("Fetching", url);
    const html = await fetchHtml(url);

    const rowMatches = Array.from(
      html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)
    ).map((m) => m[1]);
    const parsed = rowMatches
      .map((r) => {
        const tds = Array.from(r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(
          (m) => stripTags(m[1])
        );
        return tds.length ? tds : null;
      })
      .filter(Boolean);

    const pidRows = parsed.filter((cols) => cols[2] && /Pid/i.test(cols[2]));

    const enriched = [];
    for (const cols of pidRows) {
      const item = {
        raw: cols,
        nomor: cols[2] || "",
        tanggal: cols[1] || "",
        agenda: cols[5] || "",
      };
      try {
        const searchUrl = "https://sipp.pn-selong.go.id/list_perkara";
        const form = new URLSearchParams();
        form.append("search", item.nomor);
        const html2 = await fetchHtml(searchUrl, {
          method: "POST",
          body: form,
        });

        const rows2 = Array.from(
          html2.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)
        ).map((m) => m[1]);
        const first = rows2
          .map((r) =>
            Array.from(r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
              stripTags(m[1])
            )
          )
          .find((r) => r && r.length >= 3);
        if (first) {
          item.defendant = first[2] || "Nama Terdakwa";
          item.jaksa =
            first.find((c) => /Jaksa|Penuntut Umum|Penuntut/i.test(c)) ||
            "Nama Jaksa";
        } else {
          item.defendant = "Nama Terdakwa";
          item.jaksa = "Nama Jaksa";
        }
      } catch (e) {
        item.defendant = "Nama Terdakwa";
        item.jaksa = "Nama Jaksa";
      }
      enriched.push(item);
    }

    console.log(JSON.stringify({ rows: enriched }, null, 2));
  } catch (err) {
    console.error("ERROR:", err && err.message);
    console.log(JSON.stringify({ error: String(err) }));
    process.exit(1);
  }
})();
