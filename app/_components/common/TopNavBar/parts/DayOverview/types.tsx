import type { NavigationData } from "@/lib/api/types";

export interface DayOverviewProps {
  date: string;
  userId: string | null;
  data: NavigationData | null;
}