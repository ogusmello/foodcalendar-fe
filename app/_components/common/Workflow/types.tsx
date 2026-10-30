import type { ReactNode } from "react";
import type { Meal, MealPlan, MealType, User } from "@/lib/api/types";

export type WorkflowKind = "user" | "meal" | "plan" | "clone" | "edit-user" | "edit-plan" | "delete-user" | "delete-meal" | "delete-plan" | "reset";
export interface WorkflowRequest {
  kind: WorkflowKind;
  user?: User;
  meal?: Meal;
  plan?: MealPlan;
  date?: string;
  mealType?: MealType;
  userId?: string;
}
export interface WorkflowContextValue { open: (request: WorkflowRequest) => void }
export interface WorkflowProviderProps { children: ReactNode }
export interface WorkflowTriggerProps { request: WorkflowRequest; children: ReactNode; className?: string }