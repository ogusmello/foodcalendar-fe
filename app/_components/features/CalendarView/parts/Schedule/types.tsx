import type { MealPlan, MealType } from "@/lib/api/types";

export interface ScheduleProps {
  types: MealType[];
  days: string[];
  events: Record<string, MealPlan[]>;
  links: Record<string, string>;
  today: string;
  userId: string | null;
  selectedDate: string;
  incomplete: boolean;
}