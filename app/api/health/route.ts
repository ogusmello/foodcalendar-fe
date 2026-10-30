import { connection } from "next/server";
import { mockEnabled } from "@/lib/api/mocks";

export async function GET() {
  await connection();
  return Response.json({ status: "ok", mode: mockEnabled() ? "mock" : "api" }, { headers: { "Cache-Control": "no-store" } });
}