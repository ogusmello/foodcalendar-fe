import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "foodist-tests-"));
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
let app, backend;
try {
  app=await application({USE_MOCK_DATA:"true",MOCK_DATA_PATH:path.join(directory,"mock.json")});
  const base=app.base;
  assert.equal((await api(base,"/health")).mode,"mock");
  const users=await api(base,"/users"); assert.equal(users.length,2);
  const originalMeals=await api(base,"/meals"); assert.equal(originalMeals.length,20);
  await api(base,"/users","POST",{name:" "},400);
  await api(base,"/meals","POST",{name:"x".repeat(256),description:"ok"},400);
  const a=await api(base,"/users","POST",{name:"Teste A"},201);
  const b=await api(base,"/users","POST",{name:"Teste B"},201);
  assert.equal((await api(base,"/meal-plans")).filter(p=>p.user.id===a.id).length,0,"New profiles start without plans");
  const meal=await api(base,"/meals","POST",{name:"Refeição de teste",description:"Descrição"},201);
  const payload={userId:a.id,mealId:meal.id,mealType:"LUNCH",startDate:"2027-01-04",endDate:"2027-01-10",targetDays:["MONDAY","WEDNESDAY"]};
  await api(base,"/meal-plans","POST",{...payload,targetDays:[]},400);
  await api(base,"/meal-plans","POST",{...payload,mealId:999999},404);
  const plan=await api(base,"/meal-plans","POST",payload,201);
  const other=await api(base,"/meal-plans","POST",{...payload,userId:b.id},201);
  assert.notEqual(plan.id,other.id);
  assert.equal((await api(base,"/meal-plans?userId="+a.id+"&date=2027-01-04")).length,1);
  assert.equal((await api(base,"/meal-plans?userId="+a.id+"&date=2027-01-05")).length,0);
  assert.equal((await api(base,"/meal-plans?userId="+a.id)).length>1,true,"Match backend's unscoped user-only query");
  await api(base,"/meal-plans/"+plan.id,"PATCH",{endDate:"2026-01-01"},400);
  const updated=await api(base,"/meal-plans/"+plan.id,"PATCH",{userId:b.id,mealType:"DINNER"});
  assert.equal(updated.user.id,a.id,"PATCH cannot move the person");
  assert.equal(updated.mealType,"DINNER");
  await api(base,"/meals/"+meal.id,"PATCH",{description:"Descrição alterada"});
  assert.equal((await api(base,"/meal-plans?userId="+a.id+"&date=2027-01-04"))[0].meal.description,"Descrição alterada");
  const clone={userId:a.id,originalStartDate:"2027-01-04",originalEndDate:"2027-01-10",newStartDate:"2027-01-11",newEndDate:"2027-01-20"};
  assert.equal(await api(base,"/meal-plans/clone","POST",clone,201),undefined,"Clone returns empty 201");
  await api(base,"/meal-plans/clone","POST",clone,409);
  await api(base,"/meal-plans/clone","POST",{...clone,originalStartDate:"2027-01-05",newStartDate:"2027-02-01",newEndDate:"2027-02-10"},404);
  const copies=await api(base,"/meal-plans?userId="+a.id+"&startDate=2027-01-11&endDate=2027-01-20");
  assert.equal(copies.length,1); assert.deepEqual(copies[0].targetDays,payload.targetDays); assert.notEqual(copies[0].id,plan.id);
  await api(base,"/users/"+a.id,"PUT",{name:"Pessoa renomeada"});
  assert.equal((await api(base,"/meal-plans?userId="+a.id+"&date=2027-01-04"))[0].user.name,"Pessoa renomeada");
  await api(base,"/meal-plans/"+copies[0].id,"DELETE",undefined,204);
  assert.ok((await api(base,"/users")).some(user=>user.id===a.id));
  await api(base,"/users/"+a.id,"DELETE",undefined,204);
  assert.equal((await api(base,"/meal-plans")).some(p=>p.user.id===a.id),false);
  assert.ok((await api(base,"/meals")).some(item=>item.id===meal.id));
  await api(base,"/meals/"+meal.id,"DELETE",undefined,204);
  assert.equal((await api(base,"/meal-plans")).some(p=>p.meal.id===meal.id),false);
  assert.ok((await api(base,"/users")).some(user=>user.id===b.id));
  const newer=await api(base,"/users","POST",{name:"Novo ID"},201); assert.ok(newer.id>b.id);
  await api(base,"/demo/reset","POST",{},204);
  assert.equal((await api(base,"/users")).length,2);
  assert.equal((await api(base,"/meals")).length,20);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  assert.equal((await api(base,"/search?date="+today)).meals.length,10);
  assert.equal((await api(base,"/search?q=pizza")).meals.length,1);
  for(const view of ["day","week","month"]){const page=await fetch(base+"/?view="+view);assert.equal(page.status,200);assert.ok((await page.text()).includes("Adicionar ao calendário"));}
  await app.stop(); app=null;
  backend=http.createServer(async(req,res)=>{
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    const body=chunks.length?JSON.parse(Buffer.concat(chunks).toString()):{};
    res.setHeader("Content-Type","application/json");
    if(req.url==="/v1/users"&&req.method==="GET"){res.end(JSON.stringify([{id:42,name:"Servidor externo de teste"}]));return;}
    if(req.url==="/v1/users"&&req.method==="POST"){res.statusCode=201;res.end(JSON.stringify({id:43,...body}));return;}
    if(req.url==="/v1/meal-plans/clone"){res.statusCode=201;res.end();return;}
    if(req.url==="/v1/meals/77"&&req.method==="DELETE"){res.statusCode=204;res.end();return;}
    res.statusCode=404;res.end(JSON.stringify({message:"Não encontrado no servidor de teste"}));
  }).listen(0,"127.0.0.1");await once(backend,"listening");
  app=await application({USE_MOCK_DATA:"false",API_BASE_URL:"http://127.0.0.1:"+backend.address().port});
  assert.equal((await api(app.base,"/health")).mode,"api");
  assert.equal((await api(app.base,"/users"))[0].id,42,"No mock fallback");
  assert.equal((await api(app.base,"/users","POST",{name:"API real"},201)).id,43);
  await api(app.base,"/meal-plans/clone","POST",clone,201);
  await api(app.base,"/meals/77","DELETE",undefined,204);
  await api(app.base,"/demo/reset","POST",{},404);
  console.log("PASS: CRUD, persistence, recurrence, cloning, cascades, validation, calendar views and external-API transport without mock fallback.");
} finally {
  if(app)await app.stop();
  if(backend)await new Promise(resolve=>backend.close(resolve));
  for(const file of fs.readdirSync(directory))fs.unlinkSync(path.join(directory,file));
  fs.rmdirSync(directory);
}