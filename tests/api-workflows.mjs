import { externalApi } from "./external-api.mjs";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";

async function freePort() { const server = http.createServer(); server.listen(0,"127.0.0.1"); await once(server,"listening"); const port=server.address().port; await new Promise(resolve=>server.close(resolve)); return port; }
async function application(extra) {
  const port=await freePort();
  let logs="";
  const processHandle=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--port",String(port)],{env:{...process.env,...extra},stdio:["ignore","pipe","pipe"]});
  processHandle.stdout.on("data",chunk=>logs+=chunk); processHandle.stderr.on("data",chunk=>logs+=chunk);
  const base="http://127.0.0.1:"+port;
  for(let i=0;i<100;i++){ try { const response=await fetch(base+"/api/health"); if(response.ok) return {base, stop: async()=>{processHandle.kill("SIGTERM"); await once(processHandle,"exit");}}; } catch {} await new Promise(resolve=>setTimeout(resolve,100)); }
  processHandle.kill("SIGTERM"); throw new Error("Test app did not start: "+logs);
}
async function api(base, endpoint, method="GET", body, status=200) {
  const response=await fetch(base+"/api"+endpoint,{method,headers:body?{"Content-Type":"application/json"}:{},...(body?{body:JSON.stringify(body)}:{})});
  const text=await response.text(); let data; try{data=text?JSON.parse(text):undefined;}catch{throw new Error(endpoint+" returned non-JSON: "+text.slice(0,200));}
  assert.equal(response.status,status,endpoint+": "+text); return data;
}
const demoDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "yummy-demo-test-"));
let app, backend;
try {
  backend = await externalApi();
  app = await application({ API_BASE_URL: backend.url + "/" });
  assert.equal((await api(app.base, "/health")).mode, "api");
  assert.equal((await api(app.base, "/users"))[0].id, 42);
  assert.equal((await api(app.base, "/users/42")).name, "External user");
  await api(app.base, "/users", "POST", { name: " " }, 400);
  assert.equal((await api(app.base, "/users", "POST", { name: "API user" }, 201)).id, 43);
  assert.deepEqual(backend.calls.at(-1), { method: "POST", url: "/v1/users", body: { name: "API user" } });
  await api(app.base, "/users/42", "PUT", { name: "Updated" });
  await api(app.base, "/meals/77", "PATCH", { description: "Updated" });
  await api(app.base, "/meal-plans/clone", "POST", { userId: 42, originalStartDate: "2027-01-04", originalEndDate: "2027-01-10", newStartDate: "2027-01-11", newEndDate: "2027-01-17" }, 201);
  await api(app.base, "/meals/77", "DELETE", undefined, 204);
  await api(app.base, "/demo/reset", "POST", {}, 404);
  await api(app.base, "/users/99", "PUT", { name: "Missing" }, 404);
  await api(app.base, "/meals?name=invalid-json", "GET", undefined, 503);
  for (const view of ["day", "week", "month"]) {
    const response = await fetch(app.base + "/?view=" + view);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes("Adicionar ao calendário"));
  }
  await backend.close(); backend = null;
  await api(app.base, "/users", "GET", undefined, 503);
  await app.stop(); app = null;
  for (const value of ["", "   "]) {
    app = await application({ API_BASE_URL: value, MOCK_DATA_PATH: path.join(demoDirectory, "data.json") });
    assert.equal((await api(app.base, "/health")).mode, "mock");
    assert.equal((await api(app.base, "/users")).length, 2);
    assert.equal((await api(app.base, "/meals")).length >= 20, true);
    const created = await api(app.base, "/meals", "POST", { name: "Demo creation", description: "Demo description" }, 201);
    assert.ok((await api(app.base, "/meals")).some(meal => meal.id === created.id));
    const html = await (await fetch(app.base + "/")).text();
    assert.ok(html.includes("Modo demonstração"));
    await app.stop(); app = null;
  }
  for (const value of ["not-a-url", "ftp://example.com"]) {
    app = await application({ API_BASE_URL: value });
    const result = await api(app.base, "/users", "GET", undefined, 503);
    assert.match(result.message, /API_BASE_URL/);
    await app.stop(); app = null;
  }
  console.log("PASS: external API reads, writes, validation, empty responses, errors, unavailable API without fallback, automatic production demo mode and invalid configuration.");
} finally {
  if (app) await app.stop();
  if (backend) await backend.close();
  fs.rmSync(demoDirectory, { recursive: true, force: true });
}
