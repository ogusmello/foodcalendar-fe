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
      className={`flex w-full items-center text-left ${compact ? "gap-2 rounded px-1.5 py-1" : "gap-3 rounded-control px-2.5 py-2"} ${detailed ? "bg-surface/70" : category?.color ?? "bg-surface-muted text-foreground"}`}
    >
      {!detailed && <MealTypeIcon type={plan.mealType} size={compact ? 16 : 20} />}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={compact ? "whitespace-normal break-words text-sm font-medium leading-5" : "text-sm font-medium leading-5"}>{plan.meal.name}</span>
        {!compact && <span className="text-sm leading-5">{plan.user.name}</span>}
        {detailed && <span className="mt-1 text-sm leading-5 text-foreground">{plan.meal.description}</span>}
      </span>
    </MealTrigger>
  );
}