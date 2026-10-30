import "server-only";
import { getApi } from "./server";
import type { MealPlan, NavigationData, User } from "./types";

export async function getNavigationData(date: string, selected: string | null, signal?: AbortSignal): Promise<NavigationData | null> {
  const users = await getApi<User[]>("/users", signal);
  if (!Array.isArray(users) || users.some(user => !Number.isSafeInteger(user.id) || typeof user.name !== "string")) throw new Error("Invalid users");
  const targets = selected ? users.filter(user => String(user.id) === selected) : users;
  if (selected && targets.length === 0) return null;
  const results = await Promise.allSettled(targets.map(async user => {
    const plans = await getApi<MealPlan[]>(`/meal-plans?userId=${user.id}&date=${date}`, signal);
    if (!Array.isArray(plans) || plans.some(plan => !Number.isSafeInteger(plan.id) || plan.user?.id !== user.id || typeof plan.meal?.name !== "string" || typeof plan.meal?.description !== "string" || typeof plan.mealType !== "string")) throw new Error("Invalid plans");
    return plans;
  }));
  const failed = results.filter(result => result.status === "rejected").length;
  return {
    users,
    plans: results.flatMap(result => result.status === "fulfilled" ? result.value : []),
    status: failed === 0 ? "ready" : failed === results.length ? "unavailable" : "partial",
  };
}