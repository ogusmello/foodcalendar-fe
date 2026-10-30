import type { Meal } from "@/lib/api/types";

export interface MealPickerProps {
  id: string;
  meals: Meal[];
  value: string;
  onChange: (value: string) => void;
}
