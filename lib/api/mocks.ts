import type { Meal, MealPlan, MealType, User } from "./types";
import { localDate, parseDate, todayInSaoPaulo } from "../calendar";

export const mockUsers: User[] = [
  { id: 1, name: "Você" },
  { id: 2, name: "Seu par" },
];

export const mockMeals: Meal[] = [
  { id: 1, name: "Pão com ovos mexidos", description: "Pão integral, ovos mexidos e café. Uma opção prática para começar o dia." },
  { id: 2, name: "Iogurte com frutas e granola", description: "Iogurte natural com banana, morango e granola." },
  { id: 3, name: "Frango com arroz e feijão", description: "Frango grelhado, arroz, feijão e salada de folhas." },
  { id: 4, name: "Peixe assado com legumes", description: "Filé de peixe assado com batata, cenoura e abobrinha." },
  { id: 5, name: "Sanduíche natural", description: "Pão integral com frango desfiado, cenoura e folhas." },
  { id: 6, name: "Vitamina de banana", description: "Banana batida com leite, aveia e canela." },
  { id: 7, name: "Sopa de abóbora", description: "Creme de abóbora com gengibre e torradas." },
  { id: 8, name: "Omelete com salada", description: "Omelete de queijo e tomate acompanhado de folhas frescas." },
  { id: 9, name: "Frutas com chocolate", description: "Morango e banana com chocolate amargo." },
  { id: 10, name: "Mousse de maracujá", description: "Mousse de maracujá em porção individual." },
  { id: 11, name: "Panqueca de banana", description: "Panqueca de banana e aveia com uma pitada de canela." },
  { id: 12, name: "Tapioca com queijo", description: "Tapioca recheada com queijo e tomate, acompanhada de café." },
  { id: 13, name: "Macarrão ao molho de tomate", description: "Massa com molho de tomate caseiro e manjericão." },
  { id: 14, name: "Risoto de cogumelos", description: "Arroz cremoso com cogumelos e queijo parmesão." },
  { id: 15, name: "Bolo de cenoura", description: "Uma fatia de bolo de cenoura com cobertura de chocolate." },
  { id: 16, name: "Queijo com torradas", description: "Torradas integrais com queijo branco." },
  { id: 17, name: "Pizza caseira", description: "Pizza de massa fina com tomate, queijo e manjericão." },
  { id: 18, name: "Wrap de legumes", description: "Tortilha com legumes assados e molho de iogurte." },
  { id: 19, name: "Salada de frutas", description: "Frutas da estação cortadas, sem adição de açúcar." },
  { id: 20, name: "Iogurte com mel", description: "Iogurte natural com mel e castanhas." },
];

export function mockEnabled() {
  return process.env.USE_MOCK_DATA === "true" ||
    (process.env.USE_MOCK_DATA !== "false" && !process.env.API_BASE_URL && process.env.NODE_ENV === "development");
}

export function createMockPlans(): MealPlan[] {
  const today = parseDate(todayInSaoPaulo())!;
  const start = new Date(today);
  start.setDate(start.getDate() - 28);
  const end = new Date(today);
  end.setDate(end.getDate() + 56);
  const types: MealType[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER", "DESSERT"];
  return mockUsers.flatMap((user, userIndex) => types.flatMap((mealType, typeIndex) => [false, true].map((weekend) => ({
    id: user.id * 100 + typeIndex * 2 + (weekend ? 2 : 1),
    user,
    meal: mockMeals[typeIndex * 2 + userIndex + (weekend ? 10 : 0)],
    mealType,
    startDate: localDate(start),
    endDate: localDate(end),
    targetDays: weekend ? ["SATURDAY", "SUNDAY"] : ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  }))));
}

export function getMockResponse(path: string): unknown {
  const url = new URL(path, "http://mock.local");
  if (url.pathname === "/users") return structuredClone(mockUsers);
  if (url.pathname === "/meals") {
    const name = (url.searchParams.get("name") ?? "").trim().toLocaleLowerCase("pt-BR");
    return structuredClone(mockMeals.filter((meal) => meal.name.toLocaleLowerCase("pt-BR").includes(name)));
  }
  if (url.pathname === "/meal-plans") {
    const date = url.searchParams.get("date");
    const start = url.searchParams.get("startDate");
    const end = url.searchParams.get("endDate");
    const userId = url.searchParams.get("userId");
    let plans = createMockPlans();
    if (date) {
      const parsed = parseDate(date);
      if (!parsed) return [];
      const weekday = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][parsed.getDay()];
      plans = plans.filter((plan) => plan.startDate <= date && plan.endDate >= date && plan.targetDays.includes(weekday));
    } else if (start && end) {
      plans = plans.filter((plan) => plan.startDate <= end && plan.endDate >= start);
    }
    if ((date || (start && end)) && userId) plans = plans.filter((plan) => String(plan.user.id) === userId);
    return structuredClone(plans);
  }
  throw new Error("Mock endpoint not implemented");
}