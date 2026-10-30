export interface PlanSummaryProps {
  mealName?: string;
  mealType: string;
  people: string[];
  days: string[];
  startDate: string;
  endDate: string;
  repeating: boolean;
  occurrences: number;
}