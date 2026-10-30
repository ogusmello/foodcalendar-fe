import { connection } from "next/server";
import { mockEnabled } from "@/lib/api/mocks";

// Liveness only: backend availability is handled by the data routes.
export async function GET() {
  await connection();
  return Response.json({ status: "ok", mode: mockEnabled() ? "mock" : "api" }, { headers: { "Cache-Control": "no-store" } });
}
