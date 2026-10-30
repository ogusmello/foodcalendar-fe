import { getApi } from "@/lib/api/server";
import type { MealPlan, NavigationData, User } from "@/lib/api/types";
import { parseDate } from "@/lib/calendar";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? "";
  const selected = params.get("userId");
  if (!parseDate(date) || (selected !== null && !/^[1-9]\d*$/.test(selected))) {
    return Response.json({ message: "Data ou pessoa inválida." }, { status: 400 });
  }
  try {
    const users = await getApi<User[]>("/users", request.signal);
    if (!Array.isArray(users) || users.some((user) => !Number.isSafeInteger(user.id) || typeof user.name !== "string")) throw new Error("Invalid users");
    const targets = selected ? users.filter((user) => String(user.id) === selected) : users;
    if (selected && targets.length === 0) return Response.json({ message: "Pessoa não encontrada." }, { status: 404 });
    const results = await Promise.allSettled(targets.map(async (user) => {
      const plans = await getApi<MealPlan[]>(`/meal-plans?userId=${user.id}&date=${date}`, request.signal);
      if (!Array.isArray(plans) || plans.some((plan) => !Number.isSafeInteger(plan.id) || plan.user?.id !== user.id || typeof plan.meal?.name !== "string" || typeof plan.mealType !== "string")) throw new Error("Invalid plans");
      return plans;
    }));
    const failed = results.filter((result) => result.status === "rejected").length;
    const data: NavigationData = {
      users,
      plans: results.flatMap((result) => result.status === "fulfilled" ? result.value : []),
      status: failed === 0 ? "ready" : failed === results.length ? "unavailable" : "partial",
    };
    return Response.json(data);
  } catch {
    return Response.json({ message: "Não foi possível consultar o planejamento agora." }, { status: 503 });
  }
}