"use client";

import { useMealDialog } from "../MealDialog";
import type { MealTriggerProps } from "./types";

export function MealTrigger({ meal, context, children, className, title, searchResult, onOpen }: MealTriggerProps) {
  const { openMeal } = useMealDialog();
  return <button
    type="button"
    aria-haspopup="dialog"
    data-search-result={searchResult ? "" : undefined}
    title={title}
    onClick={() => { onOpen?.(); openMeal(meal, context); }}
    className={className}
  >{children}</button>;
}