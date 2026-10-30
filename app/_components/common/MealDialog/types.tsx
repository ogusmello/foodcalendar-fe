import type { ReactNode } from "react";
import type { Meal, MealType, MealPlan } from "@/lib/api/types";

export interface MealContext {
  mealType?: MealType;
  userName?: string;
  date?: string;
  plan?: MealPlan;
}
export interface MealSelection {
  meal: Meal;
  context?: MealContext;
}
export interface MealDialogContextValue {
  openMeal: (meal: Meal, context?: MealContext) => void;
}
export interface MealDialogProps { children: ReactNode }