export interface CalendarViewProps {
  searchParams: Promise<{ mealTypes?: string; mealType?: string; view?: string; date?: string; userId?: string; planId?: string }>;
}