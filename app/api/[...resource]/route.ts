import { getApi, requestApi, ApiMutationError } from "@/lib/api/server";
import { validateInput } from "@/lib/api/validation";
import type { Meal, User, MealPlan } from "@/lib/api/types";

async function handle(request: Request, context: { params: Promise<{ resource: string[] }> }) {
  const { resource: parts } = await context.params;
  const [resource, id] = parts;
  const method = request.method;
  const cloning = resource === "meal-plans" && id === "clone" && method === "POST";
  const numeric = !!id && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
  const allowed = parts.length <= 2 && (
    cloning || (["users","meals","meal-plans"].includes(resource) && (
      (method === "GET" && (!id || numeric)) ||
      (method === "POST" && !id) ||
      (method === "DELETE" && numeric) ||
      (method === "PUT" && numeric && resource === "users") ||
      (method === "PATCH" && numeric && resource !== "users")
    ))
  );
  if (!allowed) return Response.json({ message: "Operação não encontrada." }, { status: 404 });
  try {
    if (method === "GET") {
      const query = new URL(request.url).search;
      const result = await getApi<(Meal | User | MealPlan)[]>(`/${resource}${query}`, request.signal);
      if (!id) return Response.json(result);
      const item = result.find(item => String(item.id) === id);
      return item ? Response.json(item) : Response.json({ message: "Recurso não encontrado." }, { status: 404 });
    }
    let body: Record<string, unknown> | undefined;
    if (method !== "DELETE") {
      let raw: unknown;
      try { raw = await request.json(); } catch { return Response.json({ message: "JSON inválido." }, { status: 400 }); }
      body = validateInput(cloning ? "clone" : resource, method, raw);
    }
    const result = await requestApi(`/${parts.join("/")}`, method, body, request.signal);
    if (method === "DELETE") return new Response(null, { status: 204 });
    if (cloning) return new Response(null, { status: 201 });
    return Response.json(result, { status: method === "POST" ? 201 : 200 });
  } catch (error) {
    if (error instanceof ApiMutationError) return Response.json(error.body, { status: error.status });
    return Response.json({ message: "Não foi possível concluir a operação." }, { status: 503 });
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;