import type { Meal } from "@/lib/api/types";

export interface SearchProps {
  date: string;
  userId: string | null;
}
export interface SearchResponse {
  key: string;
  partial: boolean;
  meals: Meal[];
  failed: boolean;
}