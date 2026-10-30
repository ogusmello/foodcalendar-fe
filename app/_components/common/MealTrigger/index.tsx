"use client";
import { motion } from "framer-motion";

import { useMealDialog } from "../MealDialog";
import type { MealTriggerProps } from "./types";

export function MealTrigger({ meal, context, children, className, title, searchResult, onOpen }: MealTriggerProps) {
  const { openMeal } = useMealDialog();
  return <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
    type="button"
    aria-haspopup="dialog"
    data-search-result={searchResult ? "" : undefined}
    title={title}
    onClick={() => { onOpen?.(); openMeal(meal, context); }}
    className={className}
  >{children}</motion.button>;
}