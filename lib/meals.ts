import type { MealType } from "./api/types";

export const mealCategories = [
  { type: "BREAKFAST", label: "Café da manhã", color: "bg-meal-breakfast text-meal-breakfast-foreground" },
  { type: "LUNCH", label: "Almoço", color: "bg-meal-lunch text-meal-lunch-foreground" },
  { type: "SNACK", label: "Lanche", color: "bg-meal-snack text-meal-snack-foreground" },
  { type: "DINNER", label: "Jantar", color: "bg-meal-dinner text-meal-dinner-foreground" },
  { type: "DESSERT", label: "Sobremesa", color: "bg-meal-dessert text-meal-dessert-foreground" },
] satisfies { type: MealType; label: string; color: string }[];