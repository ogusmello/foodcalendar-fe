export interface PlanningProps {
  searchParams: Promise<{ date?: string; userId?: string; mealType?: string; planId?: string }>;
}