import "server-only";

export async function getApi<T>(path: string, signal?: AbortSignal): Promise<T> {
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