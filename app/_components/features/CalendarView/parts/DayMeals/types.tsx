import type { MealPlan, MealType } from "@/lib/api/types";

export interface DayMealsProps {
  types: MealType[];
  plans: MealPlan[];
  date: string;
  incomplete: boolean;
}