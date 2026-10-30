import type { Icon } from "@phosphor-icons/react";
import type { MealPlan, MealType, NavigationData } from "@/lib/api/types";

export interface DayOverviewProps {
  date: string;
  userId: string | null;
  data: NavigationData | null;
}

export interface MealSlot {
  type: MealType;
  label: string;
  icon: Icon;
  color: string;
}

export interface MealPill {
  slot: MealSlot;
  plan: MealPlan | null;
}