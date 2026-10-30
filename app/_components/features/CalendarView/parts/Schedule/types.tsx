import type { MealPlan } from "@/lib/api/types";

export interface ScheduleProps {
  days: string[];
  events: Record<string, MealPlan[]>;
  links: Record<string, string>;
  today: string;
  selectedDate: string;
  incomplete: boolean;
}