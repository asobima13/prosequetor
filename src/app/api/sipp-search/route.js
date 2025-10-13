import { NextResponse } from "next/server";
// import { setTimeout } from "node:timers/promises";
import puppeteer from "puppeteer";

function stripTags(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripTags2(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[2-9]\./g, (x) => `,\r\n${x} `);
  // .trim();
}

async function fetchHtml(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`fetch ${url} failed ${res.status}`);
  return await res.text();
}

async function searchPerkaraWithPuppeteer(nomor) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.goto("https://sipp.pn-selong.go.id/list_perkara", {
      waitUntil: "networkidle2",
    });

    // Wait for search box and type the nomor
    await page.waitForSelector("input#search-box");
    // await page.click("input#search-box");
    await page.type("input#search-box", nomor);

    // Submit the search (assuming there's a form or button)
    await page.keyboard.press("Enter");

    // Wait for results
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // await page.waitForSelector(
    //   "#tablePerkaraAll > tbody > tr:nth-child(2) > td:nth-child(5)"
    // );
    const content = await page.$eval(
      "#tablePerkaraAll > tbody > tr:nth-child(2) > td:nth-child(5)",
      (el) => el.textContent
    );
    // const content = await page.content();
    return content;
  } catch (error) {
    console.error("Puppeteer error:", error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
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
        // try to enrich by searching the perkara list with puppeteer
        const html2 = await searchPerkaraWithPuppeteer(item.nomor);

        if (html2) {
          // Extract jaksa name from text between "Penuntut Umum:" and "Terdakwa:"
          const jaksaMatch = html2.match(
            /Penuntut Umum:\s*([^<]*?)\s*Terdakwa:/
          );
          item.jaksa = jaksaMatch
            ? stripTags2(jaksaMatch[1]).trim()
            : "Nama Jaksa";

          // Extract defendant name from text after "Terdakwa:"
          const defendantMatch = html2.match(/Terdakwa:\s*([^<]*?)(?:\s*<|$)/);
          item.defendant = defendantMatch
            ? stripTags2(defendantMatch[1]).trim()
            : "Nama Terdakwa";
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
