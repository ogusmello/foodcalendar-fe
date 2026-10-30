import type { ReactNode } from "react";
import type { Meal } from "@/lib/api/types";
import type { MealContext } from "../MealDialog/types";

export interface MealTriggerProps {
  meal: Meal;
  context?: MealContext;
  children: ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  searchResult?: boolean;
  onOpen?: () => void;
}