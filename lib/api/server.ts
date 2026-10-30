import "server-only";
import { connection } from "next/server";
import { getMockResponse, mockEnabled, patchMockMeal } from "./mocks";

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
export class ApiMutationError extends Error {
  constructor(public status: number, public body: Record<string, unknown>) {
    super("API mutation failed");
  }
}

export async function patchApi<T>(path: string, body: Record<string, string>, signal?: AbortSignal): Promise<T> {
  await connection();
  signal?.throwIfAborted();
  if (mockEnabled()) {
    const id = Number(path.split("/").at(-1));
    const updated = patchMockMeal(id, body);
    if (!updated) throw new ApiMutationError(404, { message: "Refeição não encontrada." });
    return updated as T;
  }
  const base = process.env.API_BASE_URL;
  if (!base) throw new Error("API not configured");
  const response = await fetch(`${base.replace(/\/$/, "")}/v1${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const status = [400, 404, 409].includes(response.status) ? response.status : 503;
    throw new ApiMutationError(status, result && typeof result === "object" && !Array.isArray(result) ? result : { message: "Não foi possível salvar a refeição." });
  }
  return result as T;
}