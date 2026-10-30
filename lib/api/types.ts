export interface User { id: number; name: string }
export interface Meal { id: number; name: string; description: string }
export type MealType = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER" | "DESSERT";
export interface MealPlan {
  id: number;
  user: User;
  meal: Meal;
  mealType: MealType;
  startDate: string;
  endDate: string;
  targetDays: string[];
}
export interface NavigationData {
  users: User[];
  plans: MealPlan[];
  status: "ready" | "unavailable" | "partial";
}