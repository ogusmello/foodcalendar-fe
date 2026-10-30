import type { MealPlan } from "@/lib/api/types";

export interface DayMealsProps {
  plans: MealPlan[];
  date: string;
  incomplete: boolean;
}