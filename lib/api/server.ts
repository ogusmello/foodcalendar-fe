import "server-only";
import { connection } from "next/server";
import { ApiMutationError } from "./errors";
import { mockEnabled, getMockResponse, mutateMock } from "./mocks";
export { ApiMutationError } from "./errors";

export async function getApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestApi<T>(path, "GET", undefined, signal);
}
export async function patchApi<T>(path: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  return requestApi<T>(path, "PATCH", body, signal);
}
export async function requestApi<T>(path: string, method: string, body?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  await connection();
  signal?.throwIfAborted();
  if (mockEnabled()) return (method === "GET" ? getMockResponse(path) : mutateMock(path, method, body ?? {})) as T;
  const configured = process.env.API_BASE_URL?.trim();
  let base: URL;
  try {
    if (!configured) throw new Error("Missing API_BASE_URL");
    base = new URL(configured);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error("Invalid API_BASE_URL");
  } catch {
    throw new ApiMutationError(503, { message: "API não configurada. Defina API_BASE_URL com uma URL HTTP ou HTTPS válida no ambiente do servidor." });
  }
  let response: Response;
  try {
    response = await fetch(`${base.href.replace(/\/+$/, "")}/v1${path}`, {
      method, cache: "no-store",
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
    });
  } catch {
    throw new ApiMutationError(503, { message: method === "GET" ? "Backend indisponível." : "Não foi possível confirmar o resultado. Consulte os dados antes de repetir.", uncertain: method !== "GET" });
  }
  const text = await response.text();
  let result: unknown = undefined;
  try { if (text) result = JSON.parse(text); } catch { /* Handled below. */ }
  if (!response.ok) throw new ApiMutationError([400,404,409].includes(response.status) ? response.status : 503, result && typeof result === "object" && !Array.isArray(result) ? result as Record<string, unknown> : { message: "Não foi possível concluir a operação." });
  if (text && result === undefined) throw new ApiMutationError(503, { message: "Resposta inesperada do backend.", uncertain: method !== "GET" });
  return result as T;
}