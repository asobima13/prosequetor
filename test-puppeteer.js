import puppeteer from "puppeteer";

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
    await page.waitForSelector("#search-box");
    await page.type("#search-box", nomor);

    // Submit the search (assuming there's a form or button)
    await page.keyboard.press("Enter");

    // Wait for results
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const content = await page.content();
    return content;
  } catch (error) {
    console.error("Puppeteer error:", error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

// Test with a sample nomor
searchPerkaraWithPuppeteer("143/Pid.Sus/2025/PN Sel")
  .then((content) => {
    console.log("Content length:", content ? content.length : "null");
    console.log("First 1000 characters:");
    console.log(content ? content.substring(0, 1000) : "No content");
  })
  .catch((err) => {
    console.error("Test failed:", err);
  });
