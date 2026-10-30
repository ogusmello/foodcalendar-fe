import type { Meal } from "@/lib/api/types";

export interface MealFormProps {
  meal: Meal;
  onSaved: (meal: Meal) => void;
  onCancel: () => void;
  onBusyChange: (busy: boolean) => void;
}