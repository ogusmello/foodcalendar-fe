import http from "node:http";
import { once } from "node:events";

// Isolated contract responses for tests only; never imported by the application.
export async function externalApi() {
  const calls = [];
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined;
    calls.push({ method: req.method, url: req.url, body });
    res.setHeader("Content-Type", "application/json");
    const url = new URL(req.url, "http://test");
    if (url.pathname === "/v1/users" && req.method === "GET") return res.end(JSON.stringify([{ id: 42, name: "External user" }]));
    if (url.pathname === "/v1/users" && req.method === "POST") { res.statusCode = 201; return res.end(JSON.stringify({ id: 43, ...body })); }
    if (url.pathname === "/v1/users/42" && req.method === "PUT") return res.end(JSON.stringify({ id: 42, ...body }));
    if (url.pathname === "/v1/meals" && req.method === "GET") {
      if (url.searchParams.get("name") === "invalid-json") return res.end("invalid");
      return res.end(JSON.stringify([{ id: 77, name: "External meal", description: "From the external API" }]));
    }
    if (url.pathname === "/v1/meals/77" && req.method === "PATCH") return res.end(JSON.stringify({ id: 77, name: "External meal", description: "From the external API", ...body }));
    if (url.pathname === "/v1/meal-plans" && req.method === "GET") return res.end("[]");
    if (url.pathname === "/v1/meal-plans/clone") { res.statusCode = 201; return res.end(); }
    if (url.pathname === "/v1/meals/77" && req.method === "DELETE") { res.statusCode = 204; return res.end(); }
    res.statusCode = 404; res.end(JSON.stringify({ message: "External resource not found" }));
  }).listen(0, "127.0.0.1");
  await once(server, "listening");
  return { calls, url: "http://127.0.0.1:" + server.address().port, close: () => new Promise(resolve => server.close(resolve)) };
}
