import { getApi } from "@/lib/api/server";
import type { Meal } from "@/lib/api/types";
import type { MealResultsProps } from "./types";

export async function MealResults({ searchParams }: MealResultsProps) {
  const params = await searchParams;
  const name = typeof params.name === "string" ? params.name.slice(0, 255) : "";
  let meals: Meal[];
  try {
    meals = await getApi<Meal[]>(`/meals${name ? `?name=${encodeURIComponent(name)}` : ""}`);
    if (!Array.isArray(meals) || meals.some((meal) => !Number.isSafeInteger(meal.id) || typeof meal.name !== "string" || typeof meal.description !== "string")) throw new Error("Invalid meals");
  } catch {
    return <p role="status" className="rounded-card border border-border bg-surface p-6 text-sm text-muted-foreground">As refeições estão indisponíveis no momento. Tente novamente mais tarde.</p>;
  }
  const selected = typeof params.mealId === "string" ? params.mealId : null;
  if (selected) meals = meals.filter((meal) => String(meal.id) === selected);
  return (
    <div className="space-y-4">
      {name && <p className="text-sm text-muted-foreground">Resultados para “{name}”</p>}
      {meals.length === 0 && <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted-foreground">Nenhuma refeição encontrada.</p>}
      <div className="grid gap-bento sm:grid-cols-2 xl:grid-cols-3">
        {meals.map((meal) => <article key={meal.id} className={`rounded-card border bg-surface p-6 shadow-card ${selected ? "border-primary" : "border-border"}`}><h2 className="text-lg font-semibold">{meal.name}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{meal.description}</p></article>)}
      </div>
    </div>
  );
}