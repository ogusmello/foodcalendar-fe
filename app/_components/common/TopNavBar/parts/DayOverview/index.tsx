"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { MealTrigger } from "../../../MealTrigger";
import { CoffeeIcon, ForkKnifeIcon, CookieIcon, MoonIcon, CakeIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { formatDate } from "@/lib/calendar";

import type { DayOverviewProps, MealPill, MealSlot } from "./types";

const slots = [
  { type: "BREAKFAST", label: "Café da manhã", icon: CoffeeIcon, color: "bg-meal-breakfast text-meal-breakfast-foreground" },
  { type: "LUNCH", label: "Almoço", icon: ForkKnifeIcon, color: "bg-meal-lunch text-meal-lunch-foreground" },
  { type: "SNACK", label: "Lanche", icon: CookieIcon, color: "bg-meal-snack text-meal-snack-foreground" },
  { type: "DINNER", label: "Jantar", icon: MoonIcon, color: "bg-meal-dinner text-meal-dinner-foreground" },
  { type: "DESSERT", label: "Sobremesa", icon: CakeIcon, color: "bg-meal-dessert text-meal-dessert-foreground" },
] satisfies MealSlot[];

export function DayOverview({ date, data, userId }: DayOverviewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLUListElement>(null);
  const viewportId = useId();
  const reduceMotion = useReducedMotion();
  const [bounds, setBounds] = useState({ start: true, end: true });

  useEffect(() => {
    const element = viewport.current;
    const list = content.current;
    if (!element || !list) return;
    function updateBounds() {
      if (!element) return;
      const next = { start: element.scrollLeft <= 1, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1 };
      setBounds(previous => previous.start === next.start && previous.end === next.end ? previous : next);
    }
    const observer = new ResizeObserver(updateBounds);
    observer.observe(element);
    observer.observe(list);
    element.addEventListener("scroll", updateBounds, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener("scroll", updateBounds); };
  }, []);

  useEffect(() => {
    viewport.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [date, userId]);

  function move(direction: number) {
    const element = viewport.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.max(160, element.clientWidth * 0.8), behavior: reduceMotion ? "instant" : "smooth" });
  }

  const plans = data?.plans.filter((plan) => !userId || String(plan.user.id) === userId) ?? [];
  const items = slots.flatMap<MealPill>((slot) => {
    const matches = plans.filter((plan) => plan.mealType === slot.type);
    return matches.length
      ? matches.map((plan) => ({ slot, plan }))
      : [{ slot, plan: null }];
  });

  return (
    <section aria-label={`Refeições de ${date ? formatDate(date) : "hoje"}`} className="mx-auto flex w-full min-w-0 max-w-2xl items-center gap-1 rounded-full bg-surface-muted p-1">
      <button type="button" aria-label="Refeições anteriores" aria-controls={viewportId} disabled={bounds.start} onClick={() => move(-1)} className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground hover:text-primary focus-visible:-outline-offset-2 disabled:cursor-default disabled:opacity-30 md:flex"><CaretLeftIcon size={15} aria-hidden="true" /></button>
      <div
        ref={viewport}
        id={viewportId}
        role="region"
        aria-label="Refeições do dia"
        className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain rounded-full md:overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul ref={content} className="flex w-max min-w-full snap-x snap-proximity items-center gap-1.5">
          {items.map(({ slot, plan }) => {
            const Icon = slot.icon;
            const subtitle = !data ? "Carregando…"
              : data.status === "unavailable" ? "Indisponível no momento"
              : plan ? plan.meal.name
              : data.status === "partial" ? "Dados incompletos"
              : "Sem refeição planejada";

            return (
              <li key={`${slot.type}-${plan?.id ?? "empty"}`} className="shrink-0 snap-start">
                {plan ? (
                  <MealTrigger meal={plan.meal} context={{ mealType: slot.type, userName: plan.user.name, date, plan }}
                  title={`${slot.label}: ${subtitle}${plan ? ` · ${plan.user.name}` : ""}`}
                  className={`m-0.5 flex min-h-9 max-w-56 items-center gap-2 rounded-full border border-current/10 px-3 py-1 text-left hover:border-current/40 focus-visible:-outline-offset-2 ${slot.color}`}
                >
                  <Icon size={18} aria-hidden="true" className="shrink-0" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[9px] leading-3 font-semibold uppercase tracking-wide">
                      {slot.label}
                      {!userId && plan && <span className="max-w-20 truncate font-normal normal-case tracking-normal">{plan.user.name}</span>}
                    </span>
                    <span className="block truncate text-xs leading-4 font-medium">{subtitle}</span>
                  </span>
                  </MealTrigger>
                ) : (<span className={`m-0.5 flex min-h-9 max-w-56 items-center gap-2 rounded-full border border-current/10 px-3 py-1 ${slot.color}`}><Icon size={18} aria-hidden="true" /><span><span className="block text-[9px] leading-3 font-semibold uppercase tracking-wide">{slot.label}</span><span className="block text-xs leading-4 font-medium">{subtitle}</span></span></span>)}
              </li>
            );
          })}
        </ul>
      </div>
      <button type="button" aria-label="Próximas refeições" aria-controls={viewportId} disabled={bounds.end} onClick={() => move(1)} className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground hover:text-primary focus-visible:-outline-offset-2 disabled:cursor-default disabled:opacity-30 md:flex"><CaretRightIcon size={15} aria-hidden="true" /></button>
      {data?.status === "partial" && <span role="status" className="sr-only">Parte do planejamento está indisponível.</span>}
    </section>
  );
}