const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET_URL = "https://www.apni.or.id/api/hpm-prices";
const SITE_URL = "https://www.apni.or.id/";

app.get("/api/hpm-prices", async (req, res) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    await page.goto(SITE_URL, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(2000);

    const response = await page.goto(TARGET_URL, {
      waitUntil: "networkidle",
      timeout: 45000,
    });

    const status = response.status();
    const contentType = response.headers()["content-type"] || "";

    let body;
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      body = await page.content();
    }

    await browser.close();
    res.status(200).json({ upstreamStatus: status, contentType, data: body });
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => res.send("ok"));

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
