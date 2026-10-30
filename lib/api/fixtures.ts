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

export function createMockPlans(): MealPlan[] {
  const today = parseDate(todayInSaoPaulo())!;
  const start = new Date(today);
  start.setDate(start.getDate() - 28);
  const end = new Date(today);
  end.setDate(end.getDate() + 56);
  const meals = mockMeals;
  const types: MealType[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER", "DESSERT"];
  return mockUsers.flatMap((user, userIndex) => types.flatMap((mealType, typeIndex) => [false, true].map((weekend) => ({
    id: user.id * 100 + typeIndex * 2 + (weekend ? 2 : 1),
    user,
    meal: meals[typeIndex * 2 + userIndex + (weekend ? 10 : 0)],
    mealType,
    startDate: localDate(start),
    endDate: localDate(end),
    targetDays: weekend ? ["SATURDAY", "SUNDAY"] : ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  }))));
}

