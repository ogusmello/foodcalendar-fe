import { MealTypeIcon } from "../../../../common/MealTypeIcon";
import { mealCategories } from "@/lib/meals";
import { MealTrigger } from "../../../../common/MealTrigger";
import type { DayMealsProps } from "./types";



export function DayMeals({ types, plans, date, incomplete }: DayMealsProps) {
  return (
    <div className="mt-4 space-y-4">
      {mealCategories.filter(category => !types.length || types.includes(category.type)).map(category => {
        const meals = plans.filter(plan => plan.mealType === category.type);
        return (
          <section key={category.type}>
            <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold uppercase leading-5 tracking-wide text-muted-foreground">
              <MealTypeIcon type={category.type} size={18} aria-hidden="true" className="shrink-0" />
              {category.label}
            </h3>
            {meals.length ? (
              <ul className="space-y-1.5">
                {meals.map(plan => (
                  <li key={plan.id}>
                    <MealTrigger
                      meal={plan.meal}
                      context={{ mealType: plan.mealType, userName: plan.user.name, date, plan }}
                      title={`${plan.meal.name} · ${plan.user.name}`}
                      className={`flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left ${category.color}`}
                    >
                      <MealTypeIcon type={category.type} size={20} aria-hidden="true" className="shrink-0" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium leading-5">{plan.meal.name}</span>
                        <span className="text-sm leading-5">{plan.user.name}</span>
                      </span>
                    </MealTrigger>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-5 text-muted-foreground">{incomplete ? "Dados incompletos" : "Sem refeição planejada"}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}