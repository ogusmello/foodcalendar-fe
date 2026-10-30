import { getApi } from "@/lib/api/server";
import type { Meal } from "@/lib/api/types";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length > 255) return Response.json({ message: "Busca muito longa." }, { status: 400 });
  try {
    const meals = await getApi<Meal[]>(`/meals${query ? `?name=${encodeURIComponent(query)}` : ""}`, request.signal);
    if (!Array.isArray(meals) || meals.some((meal) => !Number.isSafeInteger(meal.id) || typeof meal.name !== "string" || typeof meal.description !== "string")) throw new Error("Invalid meals");
    return Response.json({ meals });
  } catch {
    return Response.json({ message: "Não foi possível consultar as refeições agora." }, { status: 503 });
  }
}