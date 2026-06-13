// Captures real product screenshots from the running app for the marketing site.
// Signs up a throwaway account (which seeds a sample workspace), then captures
// each page in light + dark themes and writes optimized webp into public/screenshots.
//
// Prereq: dev server running on http://localhost:3000.
// Run:    node scripts/capture-screenshots.mjs
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "screenshots");
// Must match BETTER_AUTH_URL's origin or Better Auth rejects the login as
// cross-origin (protected pages would then redirect back to /login).
const BASE = process.env.SHOT_BASE_URL ?? "http://localhost:3001";
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const VIEWPORT = { width: 1366, height: 860, deviceScaleFactor: 2 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(OUT, { recursive: true });
  const db = new PrismaClient();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    defaultViewport: VIEWPORT,
    args: ["--no-sandbox", "--hide-scrollbars"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // --- Log in as the curated Northbeam Studio owner (see prisma/seed.ts) ----
    // Captures the hand-built launch demo data rather than a throwaway account.
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
    // Dev-mode first compile can lag; wait for the form before typing.
    await page.waitForSelector("#email", { timeout: 60000 });
    await page.type("#email", "owner@northbeam.studio");
    await page.type("#password", "Sarion!Demo123");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle0" });
    await wait(1200);

    // Portal shot → Orbit Labs (its Website Redesign project has an active
    // client/team discussion thread, so the portal looks alive).
    const client =
      (await db.client.findFirst({
        where: { email: "founders@orbitlabs.io" },
        select: { portalToken: true },
      })) ??
      (await db.client.findFirst({
        orderBy: { createdAt: "desc" },
        select: { portalToken: true },
      }));
    const portalPath = client ? `/portal/${client.portalToken}` : null;

    const routes = [
      { name: "dashboard", path: "/dashboard" },
      { name: "clients", path: "/clients" },
      { name: "projects", path: "/projects" },
      { name: "invoices", path: "/invoices" },
      { name: "team", path: "/team" },
      ...(portalPath ? [{ name: "portal", path: portalPath }] : []),
    ];

    for (const theme of ["light", "dark"]) {
      for (const route of routes) {
        await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle0" });
        // Apply theme via next-themes storage, then reload to paint it.
        await page.evaluate((t) => localStorage.setItem("theme", t), theme);
        await page.reload({ waitUntil: "networkidle0" });
        // Hide the Next.js dev indicator (absent in production builds).
        await page.addStyleTag({
          content:
            "nextjs-portal,#__next-build-watcher,[data-nextjs-toast]{display:none !important;}",
        });
        await wait(700);

        const buf = await page.screenshot({ type: "png" });
        const file = join(OUT, `${route.name}-${theme}.webp`);
        await sharp(buf).resize({ width: 1600 }).webp({ quality: 82 }).toFile(file);
        console.log(`captured ${route.name}-${theme}.webp`);
      }
    }
  } finally {
    await browser.close();
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
