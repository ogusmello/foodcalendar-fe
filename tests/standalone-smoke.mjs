import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
const output=path.resolve(".next/standalone");
assert.ok(fs.existsSync(path.join(output,"server.js")),"Run pnpm build first");
fs.cpSync("public",path.join(output,"public"),{recursive:true});
fs.cpSync(".next/static",path.join(output,".next/static"),{recursive:true});
const directory=fs.mkdtempSync(path.join(os.tmpdir(),"foodist-standalone-"));
const probe=http.createServer().listen(0,"127.0.0.1");await once(probe,"listening");const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
let child;
async function start(){
  child=spawn(process.execPath,["server.js"],{cwd:output,env:{...process.env,NODE_ENV:"production",HOSTNAME:"127.0.0.1",PORT:String(port),USE_MOCK_DATA:"true",MOCK_DATA_PATH:path.join(directory,"demo.json")},stdio:"ignore"});
  for(let i=0;i<100;i++){try{const response=await fetch("http://127.0.0.1:"+port+"/api/health");if(response.ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
  throw new Error("Standalone failed to start");
}
async function stop(){child.kill("SIGTERM");await once(child,"exit");child=undefined;}
const base="http://127.0.0.1:"+port;
try{
  await start();
  const page=await fetch(base+"/");assert.equal(page.status,200);const html=await page.text();assert.ok(html.includes("Calendário"));
  assert.equal((await fetch(base+"/foodist_mark_2.svg")).status,200);
  const css=html.match(/href="([^"]+\.css[^"]*)"/)?.[1];assert.ok(css);assert.equal((await fetch(base+css)).status,200);
  const response=await fetch(base+"/api/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"Persistência standalone"})});assert.equal(response.status,201);const user=await response.json();
  await stop();await start();
  const users=await(await fetch(base+"/api/users")).json();assert.ok(users.some(item=>item.id===user.id));
  console.log("PASS: standalone runtime, health, rendered Home, static assets and mock persistence after restart.");
}finally{
  if(child)await stop();
  for(const file of fs.readdirSync(directory))fs.unlinkSync(path.join(directory,file));fs.rmdirSync(directory);
}