import { mealCategories } from "@/lib/meals";
import { MealTrigger } from "../../../../common/MealTrigger";
import { MealTypeIcon } from "../../../../common/MealTypeIcon";
import type { MealCardProps } from "./types";

export function MealCard({ plan, date, variant = "default" }: MealCardProps) {
  const category = mealCategories.find(item => item.type === plan.mealType);
  const compact = variant === "compact";
  const detailed = variant === "detailed";
  return (
    <MealTrigger
      meal={plan.meal}
      context={{ mealType: plan.mealType, userName: plan.user.name, date, plan }}
      title={`${category?.label ?? plan.mealType} · ${plan.meal.name} · ${plan.user.name}`}
      className={`flex w-full items-center text-left ${compact ? "gap-1 rounded px-1.5 py-1" : "gap-2 rounded-control px-2.5 py-2"} ${detailed ? "bg-surface/70" : category?.color ?? "bg-surface-muted text-foreground"}`}
    >
      <MealTypeIcon type={plan.mealType} size={compact ? 12 : 16} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={compact ? "truncate text-[10px] font-medium leading-3" : "text-xs font-medium leading-4"}>{plan.meal.name}</span>
        {!compact && <span className="text-[10px] leading-3">{plan.user.name}</span>}
        {detailed && <span className="mt-1 text-xs leading-4 text-foreground">{plan.meal.description}</span>}
      </span>
    </MealTrigger>
  );
}