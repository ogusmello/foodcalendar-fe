import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { externalApi } from "./external-api.mjs";
const backend = await externalApi();
const probe = http.createServer().listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], { env: { ...process.env, API_BASE_URL: backend.url }, stdio: "ignore" });
const base = "http://127.0.0.1:" + port;
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base + "/api/health")).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/refeicoes");
  await page.getByRole("button", { name: "External meal", exact: true }).waitFor();
  assert.equal(await page.getByText("Modo demonstração", { exact: false }).count(), 0);
  await page.getByRole("button", { name: "Nova refeição", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Nova refeição", exact: true });
  await dialog.getByLabel("Nome", { exact: true }).fill("API meal");
  await dialog.getByLabel("Descrição", { exact: true }).fill("API description");
  // The test server does not implement creation: the actual API error must be displayed.
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  await dialog.getByRole("alert").waitFor();
  assert.ok(backend.calls.some(call => call.method === "POST" && call.url === "/v1/meals" && call.body.name === "API meal"));
  await page.keyboard.press("Escape");
  for (const view of ["day", "week", "month"]) {
    await page.goto(base + "/?view=" + view);
    await page.getByRole("heading", { name: "Calendário", exact: true }).waitFor();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/refeicoes");
  await page.getByRole("button", { name: "External meal", exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log("PASS: external data rendered, mutation error surfaced, calendar views and mobile UI.");
} finally {
  if (browser) await browser.close();
  child.kill("SIGTERM"); await once(child, "exit");
  await backend.close();
}
