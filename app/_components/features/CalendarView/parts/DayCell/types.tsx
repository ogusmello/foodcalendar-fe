import type { MealPlan } from "@/lib/api/types";

export interface DayCellProps {
  date: string;
  today: string;
  selected: boolean;
  inMonth: boolean;
  plans: MealPlan[];
  href: string;
  incomplete: boolean;
}