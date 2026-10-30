import type { Meal } from "@/lib/api/types";

export interface SearchProps {
  date: string;
  userId: string | null;
}
export interface SearchResponse {
  query: string;
  meals: Meal[];
  failed: boolean;
}