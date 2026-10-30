import type { MealPlan } from "@/lib/api/types";

export interface DayCellProps {
  date: string;
  userId: string | null;
  today: string;
  selected: boolean;
  inMonth: boolean;
  plans: MealPlan[];
  href: string;
  incomplete: boolean;
}