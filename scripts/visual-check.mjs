import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const targets = [
  { name: "desktop", viewport: { width: 1440, height: 920 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true },
];

const outDir = path.resolve("screenshots");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const target of targets) {
  const page = await browser.newPage({
    viewport: target.viewport,
    isMobile: Boolean(target.isMobile),
  });

  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1500);

  const screenshot = path.join(outDir, `${target.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });

  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const rect = canvas.getBoundingClientRect();
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    const sample = new Uint8Array(4);
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    let coloredSamples = 0;

    for (const xRatio of [0.2, 0.35, 0.5, 0.65, 0.8]) {
      for (const yRatio of [0.2, 0.35, 0.5, 0.65, 0.8]) {
        const x = Math.max(0, Math.min(width - 1, Math.floor(width * xRatio)));
        const y = Math.max(0, Math.min(height - 1, Math.floor(height * yRatio)));
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, sample);
        if (sample[3] > 0 && sample[0] + sample[1] + sample[2] > 30) {
          coloredSamples += 1;
        }
      }
    }

    const overflowItems = [...document.querySelectorAll("button, select, output, strong, h1, h2, p, span")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return element.scrollWidth > element.clientWidth + 2 && style.overflowX === "visible";
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName,
        text: element.textContent.trim().slice(0, 60),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));

    return {
      canvasCss: { width: Math.round(rect.width), height: Math.round(rect.height) },
      drawingBuffer: { width, height },
      coloredSamples,
      overflowItems,
      planeTitle: document.querySelector("#planeTitle")?.textContent,
    };
  });

  results.push({ target: target.name, screenshot, ...metrics });
  await page.close();
}

await browser.close();

const failures = results.filter(
  (result) =>
    result.canvasCss.width < 260 ||
    result.canvasCss.height < 260 ||
    result.coloredSamples < 3 ||
    result.overflowItems.length > 0,
);

console.log(JSON.stringify(results, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
