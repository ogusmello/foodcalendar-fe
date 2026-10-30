import "server-only";
import { connection } from "next/server";
import { getMockResponse, mockEnabled } from "./mocks";

export async function getApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  await connection();
  signal?.throwIfAborted();
  if (mockEnabled()) return getMockResponse(path) as T;
  const base = process.env.API_BASE_URL;
  if (!base) throw new Error("API not configured");
  const response = await fetch(`${base.replace(/\/$/, "")}/v1${path}`, {
    cache: "no-store",
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return response.json() as Promise<T>;
}