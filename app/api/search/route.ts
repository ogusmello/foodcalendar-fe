import { getApi } from "@/lib/api/server";
import { getNavigationData } from "@/lib/api/navigation";
import type { Meal } from "@/lib/api/types";
import { parseDate } from "@/lib/calendar";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  if (query.length > 255) return Response.json({ message: "Busca muito longa." }, { status: 400 });
  try {
    if (!query) {
      const date = params.get("date") ?? "";
      const person = params.get("userId");
      if (!parseDate(date) || (person !== null && !/^[1-9]\d*$/.test(person))) {
        return Response.json({ message: "Informe uma data e pessoa válidas." }, { status: 400 });
      }
      const data = await getNavigationData(date, person, request.signal);
      if (!data) return Response.json({ message: "Pessoa não encontrada." }, { status: 404 });
      if (data.status === "unavailable") throw new Error("Day unavailable");
      const meals = [...new Map(data.plans.map(plan => [plan.meal.id, plan.meal])).values()];
      return Response.json({ meals, partial: data.status === "partial" });
    }
    const meals = await getApi<Meal[]>(`/meals?name=${encodeURIComponent(query)}`, request.signal);
    if (!Array.isArray(meals) || meals.some(meal => !Number.isSafeInteger(meal.id) || typeof meal.name !== "string" || typeof meal.description !== "string")) throw new Error("Invalid meals");
    return Response.json({ meals, partial: false });
  } catch {
    return Response.json({ message: "Não foi possível consultar as refeições agora." }, { status: 503 });
  }
}