"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CoffeeIcon, ForkKnifeIcon, CookieIcon, MoonIcon, CakeIcon } from "@phosphor-icons/react";
import { mealCategories } from "@/lib/meals";
import type { MealType } from "@/lib/api/types";
import type { MealFiltersProps } from "./types";

const icons = { BREAKFAST: CoffeeIcon, LUNCH: ForkKnifeIcon, SNACK: CookieIcon, DINNER: MoonIcon, DESSERT: CakeIcon };

export function MealFilters({ selected }: MealFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(type?: MealType) {
    const next = type
      ? selected.includes(type) ? selected.filter(value => value !== type) : [...selected, type]
      : [];
    const query = new URLSearchParams(params.toString());
    query.delete("mealType");
    if (next.length) query.set("mealTypes", next.join(",")); else query.delete("mealTypes");
    startTransition(() => router.replace(`${pathname}?${query}`, { scroll: false }));
  }

  return (
    <div role="group" aria-label="Filtrar tipos de refeição" aria-busy={pending} className="flex flex-wrap items-center gap-2 p-4">
      <button type="button" aria-pressed={selected.length === 0} disabled={pending} onClick={() => update()} className={`rounded-full border px-2.5 py-1 text-[10px] font-medium disabled:cursor-wait ${selected.length === 0 ? "border-primary/30 bg-primary-muted text-primary-muted-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>Todos</button>
      {mealCategories.map(category => {
        const Icon = icons[category.type];
        const active = selected.includes(category.type);
        return (
          <button key={category.type} type="button" aria-pressed={active} disabled={pending} onClick={() => update(category.type)} className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium disabled:cursor-wait ${category.color} ${active ? "border-current ring-2 ring-foreground ring-offset-2 ring-offset-surface" : "border-transparent hover:border-current/30"}`}>
            <Icon size={12} aria-hidden="true" />
            {category.label}
          </button>
        );
      })}
      {pending && <span role="status" className="sr-only">Atualizando tipos de refeição</span>}
    </div>
  );
}