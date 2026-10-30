import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { execFileSync } from "node:child_process";
const probe=http.createServer().listen(0,"127.0.0.1");await once(probe,"listening");const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const project="foodist-smoke-"+process.pid;
const tag="smoke-"+process.pid;
const env={...process.env,FOODIST_TAG:tag,PORT:String(port),API_BASE_URL:"http://127.0.0.1:1"};
const args=["compose","--project-name",project];
function compose(command, capture=false){return execFileSync("docker",[...args,...command],{env,stdio:capture?["ignore","pipe","pipe"]:"inherit",encoding:"utf8"});}
const base="http://127.0.0.1:"+port;
try{
  compose(["config","--quiet"]);
  compose(["build"]);
  compose(["up","-d","--wait","--wait-timeout","60"]);
  assert.equal(compose(["exec","-T","web","node","-p","process.getuid()"],true).trim(),"1001");
  compose(["exec","-T","web","test","!","-e","/app/.env.local"]);
  const health=await(await fetch(base+"/api/health")).json();assert.equal(health.mode,"api");
  const page=await fetch(base+"/");assert.equal(page.status,200);const html=await page.text();assert.ok(html.includes("Calendário"));
  const css=html.match(/href="([^"]+\.css[^"]*)"/)?.[1];assert.ok(css);assert.equal((await fetch(base+css)).status,200);
  assert.equal((await fetch(base + "/api/users")).status, 503, "No fabricated data when the API is unavailable");
  compose(["up", "-d", "--force-recreate", "--wait", "--wait-timeout", "60"]);
  let status;
  for (let attempt = 0; attempt < 10; attempt++) {
    try { status = (await fetch(base + "/api/users", { headers: { Connection: "close" } })).status; break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(status, 503);
  const logs=compose(["logs","--no-color","web"],true);assert.ok(logs.includes("Ready"));
  console.log("PASS: Docker image, Compose, health, uid 1001, excluded private env, assets, logs and API-only behavior after recreation.");
}finally{
  compose(["down","--volumes","--remove-orphans"]);
  try{execFileSync("docker",["image","rm","foodist-fe:"+tag],{stdio:"ignore"});}catch{}
}