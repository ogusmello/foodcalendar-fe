"use client";

import Link from "next/link";
import { CoffeeIcon, ForkKnifeIcon, CookieIcon, MoonIcon, CakeIcon } from "@phosphor-icons/react";
import { formatDate } from "@/lib/calendar";

import type { DayOverviewProps, MealPill, MealSlot } from "./types";

const slots = [
  { type: "BREAKFAST", label: "Café da manhã", icon: CoffeeIcon },
  { type: "LUNCH", label: "Almoço", icon: ForkKnifeIcon },
  { type: "SNACK", label: "Lanche", icon: CookieIcon },
  { type: "DINNER", label: "Jantar", icon: MoonIcon },
  { type: "DESSERT", label: "Sobremesa", icon: CakeIcon },
] satisfies MealSlot[];

export function DayOverview({ date, data, userId }: DayOverviewProps) {
  const plans = data?.plans.filter((plan) => !userId || String(plan.user.id) === userId) ?? [];
  const items = slots.flatMap<MealPill>((slot) => {
    const matches = plans.filter((plan) => plan.mealType === slot.type);
    return matches.length
      ? matches.map((plan) => ({ slot, plan }))
      : [{ slot, plan: null }];
  });

  return (
    <section aria-label={`Refeições de ${date ? formatDate(date) : "hoje"}`} className="min-w-0 rounded-full bg-primary-muted/50 p-1.5">
      <div
        role="region"
        aria-label="Refeições do dia, role horizontalmente para explorar"
        tabIndex={0}
        className="overflow-x-auto overscroll-x-contain rounded-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max min-w-full snap-x snap-proximity items-center gap-2">
          {items.map(({ slot, plan }) => {
            const Icon = slot.icon;
            const params = new URLSearchParams({ date, mealType: slot.type });
            if (plan) {
              params.set("userId", String(plan.user.id));
              params.set("planId", String(plan.id));
            } else if (userId) params.set("userId", userId);
            const subtitle = !data ? "Carregando…"
              : data.status === "unavailable" ? "Indisponível no momento"
              : plan ? plan.meal.name
              : data.status === "partial" ? "Dados incompletos"
              : "Sem refeição planejada";

            return (
              <li key={`${slot.type}-${plan?.id ?? "empty"}`} className="shrink-0 snap-start">
                <Link
                  href={`/?${params}`}
                  title={`${slot.label}: ${subtitle}${plan ? ` · ${plan.user.name}` : ""}`}
                  className="m-0.5 flex min-h-12 max-w-80 items-center gap-3 rounded-full border border-primary/15 bg-primary-muted px-5 py-2 text-primary-muted-foreground hover:border-primary/40 hover:bg-surface focus-visible:-outline-offset-2"
                >
                  <Icon size={24} aria-hidden="true" className="shrink-0" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
                      {slot.label}
                      {!userId && plan && <span className="max-w-20 truncate font-normal normal-case tracking-normal">{plan.user.name}</span>}
                    </span>
                    <span className="block truncate text-sm font-medium text-foreground">{subtitle}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {data?.status === "partial" && <span role="status" className="sr-only">Parte do planejamento está indisponível.</span>}
    </section>
  );
}