import { getApi, patchApi, ApiMutationError } from "@/lib/api/server";
import type { Meal } from "@/lib/api/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ mealId: string }> }) {
  const { mealId } = await params;
  if (!/^[1-9]\d*$/.test(mealId) || !Number.isSafeInteger(Number(mealId))) return Response.json({ message: "Refeição inválida." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Dados inválidos." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ message: "Dados inválidos." }, { status: 400 });
  const payload: Partial<Pick<Meal, "name" | "description">> = {};
  const errors: Record<string, string> = {};
  const fields = body as Record<string, unknown>;
  for (const field of ["name", "description"] as const) {
    if (fields[field] === undefined || fields[field] === null) continue;
    if (typeof fields[field] !== "string" || !fields[field].trim()) errors[field] = "Informe um texto válido.";
    else if (field === "name" && fields[field].length > 255) errors[field] = "Use no máximo 255 caracteres.";
    else payload[field] = fields[field];
  }
  if (Object.keys(errors).length) return Response.json(errors, { status: 400 });
  try {
    return Response.json(await patchApi<Meal>(`/meals/${mealId}`, payload, request.signal));
  } catch (error) {
    if (error instanceof ApiMutationError) return Response.json(error.body, { status: error.status });
    return Response.json({ message: "Não foi possível salvar a refeição. Tente novamente." }, { status: 503 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ mealId: string }> }) {
  const { mealId } = await params;
  if (!/^[1-9]\d*$/.test(mealId)) return Response.json({ message: "Refeição inválida." }, { status: 400 });
  try {
    const meals = await getApi<Meal[]>("/meals", request.signal);
    const meal = meals.find(item => String(item.id) === mealId);
    return meal ? Response.json(meal) : Response.json({ message: "Refeição não encontrada." }, { status: 404 });
  } catch {
    return Response.json({ message: "Refeição indisponível no momento." }, { status: 503 });
  }
}