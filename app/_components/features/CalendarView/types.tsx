export interface CalendarViewProps {
  searchParams: Promise<{ date?: string; userId?: string; planId?: string }>;
}