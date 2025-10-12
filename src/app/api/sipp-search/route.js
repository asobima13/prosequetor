import { NextResponse } from "next/server";

function stripTags(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function fetchHtml(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`fetch ${url} failed ${res.status}`);
  return await res.text();
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { date } = body; // expected 'DD/MM/YYYY'
    if (!date)
      return NextResponse.json({ error: "missing date" }, { status: 400 });

    const path = `1/${date}`;
    const url = `https://sipp.pn-selong.go.id/list_jadwal_sidang/search/${path}`;

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
        // try to enrich by searching the perkara list
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

    return NextResponse.json({ rows: enriched });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
