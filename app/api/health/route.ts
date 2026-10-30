import { connection } from "next/server";

// Liveness only: backend availability is handled by the data routes.
export async function GET() {
  await connection();
  return Response.json({ status: "ok", mode: "api" }, { headers: { "Cache-Control": "no-store" } });
}
