export interface CalendarViewProps {
  searchParams: Promise<{ view?: string; date?: string; userId?: string; planId?: string }>;
}