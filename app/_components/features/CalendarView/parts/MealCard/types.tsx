import type { MealPlan } from "@/lib/api/types";
export interface MealCardProps {
  plan: MealPlan;
  date: string;
  variant?: "default" | "compact" | "detailed";
}