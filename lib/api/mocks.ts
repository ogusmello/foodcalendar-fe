import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Meal, MealPlan, User } from "./types";
import { mockUsers, mockMeals, createMockPlans } from "./fixtures";
import { parseDate } from "../calendar";
import { ApiMutationError } from "./errors";

interface PlanRecord { id: number; userId: number; mealId: number; mealType: MealPlan["mealType"]; startDate: string; endDate: string; targetDays: string[] }
interface Store { version: 1; users: User[]; meals: Meal[]; plans: PlanRecord[]; next: { users: number; meals: number; plans: number } }
const filePath = () => process.env.MOCK_DATA_PATH || path.join(process.cwd(), ".next", "cache", "yummy-demo-v1.json");

export function mockEnabled() {
  return !process.env.API_BASE_URL?.trim();
}
function save(store: Store) {
  const file = filePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = file + "." + process.pid + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(store));
  fs.renameSync(temporary, file);
}
function seed(): Store {
  const meals = structuredClone(mockMeals);
  const plans = createMockPlans().map(plan => ({ id: plan.id, userId: plan.user.id, mealId: plan.meal.id, mealType: plan.mealType, startDate: plan.startDate, endDate: plan.endDate, targetDays: plan.targetDays }));
  return { version: 1, users: structuredClone(mockUsers), meals, plans, next: { users: Math.max(...mockUsers.map(u => u.id), 0) + 1, meals: Math.max(...meals.map(m => m.id), 0) + 1, plans: Math.max(...plans.map(p => p.id), 0) + 1 } };
}
function load(): Store {
  try {
    const store = JSON.parse(fs.readFileSync(/* turbopackIgnore: true */ filePath(), "utf8")) as Store;
    if (store.version !== 1) throw new Error("Unsupported mock store");
    return store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const store = seed(); save(store); return store;
  }
}
function expand(store: Store, plan: PlanRecord): MealPlan {
  return { ...plan, user: store.users.find(u => u.id === plan.userId)!, meal: store.meals.find(m => m.id === plan.mealId)! };
}
const missing = () => new ApiMutationError(404, { message: "Recurso não encontrado." });

export function getMockResponse(input: string): unknown {
  const url = new URL(input, "http://mock.local");
  const store = load();
  if (url.pathname === "/users") return store.users;
  if (url.pathname === "/meals") {
    const name = (url.searchParams.get("name") ?? "").trim().toLocaleLowerCase("pt-BR");
    return store.meals.filter(meal => meal.name.toLocaleLowerCase("pt-BR").includes(name));
  }
  if (url.pathname === "/meal-plans") {
    const date = url.searchParams.get("date"), start = url.searchParams.get("startDate"), end = url.searchParams.get("endDate"), userId = url.searchParams.get("userId");
    let plans = store.plans;
    if (date) {
      const parsed = parseDate(date);
      if (!parsed) return [];
      const weekday = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][parsed.getDay()];
      plans = plans.filter(p => p.startDate <= date && p.endDate >= date && p.targetDays.includes(weekday));
    } else if (start && end) plans = plans.filter(p => p.startDate <= end && p.endDate >= start);
    if ((date || (start && end)) && userId) plans = plans.filter(p => String(p.userId) === userId);
    return plans.map(p => expand(store, p));
  }
  throw missing();
}
export function mutateMock(input: string, method: string, body: Record<string, unknown>): unknown {
  const store = load();
  const [resource, segment] = input.replace(/^\//, "").split("/");
  const id = Number(segment);
  let result: unknown;
  if (resource === "users") {
    if (method === "POST") { const user = { id: store.next.users++, name: body.name as string }; store.users.push(user); result = user; }
    else {
      const user = store.users.find(u => u.id === id); if (!user) throw missing();
      if (method === "DELETE") { store.users = store.users.filter(u => u.id !== id); store.plans = store.plans.filter(p => p.userId !== id); }
      else { user.name = body.name as string; result = user; }
    }
  } else if (resource === "meals") {
    if (method === "POST") { const meal = { id: store.next.meals++, name: body.name as string, description: body.description as string }; store.meals.push(meal); result = meal; }
    else {
      const meal = store.meals.find(m => m.id === id); if (!meal) throw missing();
      if (method === "DELETE") { store.meals = store.meals.filter(m => m.id !== id); store.plans = store.plans.filter(p => p.mealId !== id); }
      else { Object.assign(meal, body); result = meal; }
    }
  } else if (resource === "meal-plans") {
    if (segment === "clone") {
      if (store.plans.some(p => p.userId === body.userId && p.startDate === body.newStartDate && p.endDate === body.newEndDate)) throw new ApiMutationError(409, { message: "Já existem planos alimentares cadastrados nesse período." });
      const originals = store.plans.filter(p => p.userId === body.userId && p.startDate === body.originalStartDate && p.endDate === body.originalEndDate);
      if (!originals.length) throw new ApiMutationError(404, { message: "Nenhum plano encontrado com as datas exatas de origem." });
      store.plans.push(...originals.map(p => ({ ...p, id: store.next.plans++, startDate: body.newStartDate as string, endDate: body.newEndDate as string })));
    } else if (method === "DELETE") {
      if (!store.plans.some(p => p.id === id)) throw missing();
      store.plans = store.plans.filter(p => p.id !== id);
    } else {
      const existing = method === "PATCH" ? store.plans.find(p => p.id === id) : undefined;
      if (method === "PATCH" && !existing) throw missing();
      const record = { ...existing, ...body, id: existing?.id ?? store.next.plans } as PlanRecord;
      if (!store.users.some(u => u.id === record.userId) || !store.meals.some(m => m.id === record.mealId)) throw missing();
      if (record.startDate > record.endDate) throw new ApiMutationError(400, { endDate: "O fim deve ser igual ou posterior ao início." });
      if (existing) Object.assign(existing, record); else { store.next.plans++; store.plans.push(record); }
      result = expand(store, record);
    }
  } else throw missing();
  save(store);
  return result;
}