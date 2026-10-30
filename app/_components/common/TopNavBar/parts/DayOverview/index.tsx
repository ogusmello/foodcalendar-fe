"use client";

import Link from "next/link";
import { useRef } from "react";
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { formatDate } from "@/lib/calendar";
import type { MealType } from "@/lib/api/types";
import type { DayOverviewProps } from "./types";

const slots = [
  { type: "BREAKFAST", label: "Café da manhã" },
  { type: "LUNCH", label: "Almoço" },
  { type: "SNACK", label: "Lanche" },
  { type: "DINNER", label: "Jantar" },
  { type: "DESSERT", label: "Sobremesa" },
] satisfies { type: MealType; label: string }[];

export function DayOverview({ date, data, userId }: DayOverviewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const users = data?.users.filter((user) => !userId || String(user.id) === userId) ?? [];
  const params = new URLSearchParams({ date });
  if (userId) params.set("userId", userId);

  function scroll(direction: number) {
    viewport.current?.scrollBy({ left: direction * 240, behavior: "instant" });
  }

  return (
    <section aria-label="Mini calendário do dia" className="min-w-0 overflow-hidden rounded-control border border-border bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-1">
        <Link href={`/?${params}`} className="flex min-w-0 items-center gap-1.5 rounded text-xs font-medium hover:text-primary">
          <CalendarBlankIcon size={14} aria-hidden="true" />
          <span className="truncate">{date ? formatDate(date, { day: "numeric", month: "short" }) : "Carregando dia…"}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="max-w-28 truncate text-[10px] text-muted-foreground">{userId ? users[0]?.name ?? "Individual" : "Ambos"}</span>
          <div className="flex gap-1">
            <button type="button" aria-label="Rolar calendário para a esquerda" onClick={() => scroll(-1)} className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-surface-muted hover:text-foreground"><CaretLeftIcon size={13} aria-hidden="true" /></button>
            <button type="button" aria-label="Rolar calendário para a direita" onClick={() => scroll(1)} className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-surface-muted hover:text-foreground"><CaretRightIcon size={13} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
      <div ref={viewport} role="region" aria-label="Timeline de refeições, com rolagem horizontal" tabIndex={0} className="max-h-40 overflow-auto overscroll-x-contain [scrollbar-width:thin]">
        <table className="w-full min-w-[50rem] table-fixed border-separate border-spacing-0 text-left text-[11px]">
          <caption className="sr-only">Refeições por pessoa e tipo em {date ? formatDate(date) : "dia selecionado"}. A API não informa horários.</caption>
          <colgroup><col className="w-24" />{slots.map((slot) => <col key={slot.type} />)}</colgroup>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 border-r border-b border-border bg-surface px-3 py-1 font-medium text-muted-foreground">Pessoa</th>
              {slots.map((slot) => <th key={slot.type} scope="col" className="border-r border-b border-border bg-surface px-2 py-1 font-medium text-muted-foreground last:border-r-0">{slot.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => <tr key={user.id}>
              <th scope="row" className="sticky left-0 z-10 border-r border-b border-border bg-surface px-3 py-1.5 font-medium">
                <span className="block truncate" title={user.name}>{user.name}</span>
              </th>
              {slots.map((slot) => {
                const meals = data?.plans.filter((plan) => plan.user.id === user.id && plan.mealType === slot.type) ?? [];
                const linkParams = new URLSearchParams({ date, userId: String(user.id), mealType: slot.type });
                return (
                  <td key={slot.type} className="border-r border-b border-border px-1 py-1 align-top last:border-r-0">
                    {meals.length > 0 ? <div className="space-y-1">{meals.map((plan) => <Link
                      key={plan.id}
                      href={`/?${linkParams}&planId=${plan.id}`}
                      title={`${plan.meal.name} · ${user.name} · ${slot.label}`}
                      className={`block truncate rounded-sm border-l-2 px-2 py-1 text-[11px] font-medium hover:underline ${index % 2 === 0 ? "border-primary bg-primary-muted text-primary-muted-foreground" : "border-accent bg-accent-muted text-accent"}`}
                    >{plan.meal.name}</Link>)}</div> : <span className="block px-2 py-1 text-[10px] text-muted-foreground">{data?.status === "ready" ? "—" : "Indisponível"}</span>}
                  </td>
                );
              })}
            </tr>)}
            {users.length === 0 && <tr>
              <th scope="row" className="sticky left-0 z-10 border-r border-border bg-surface px-3 py-3 font-medium text-muted-foreground">{userId ? "Individual" : "Ambos"}</th>
              <td colSpan={5} className="px-3 py-3 text-muted-foreground" role="status">
                {!data ? "Carregando refeições do dia…" : data.status === "unavailable" ? "Planejamento indisponível no momento." : "Nenhuma pessoa cadastrada."}
              </td>
            </tr>}
          </tbody>
        </table>
      </div>
      {data?.status === "partial" && <p role="status" className="border-t border-border px-3 py-1 text-[10px] text-warning">Parte do planejamento está indisponível.</p>}
      {users.length > 0 && data?.status === "unavailable" && <p role="status" className="border-t border-border px-3 py-1 text-[10px] text-muted-foreground">Não foi possível carregar as refeições.</p>}
    </section>
  );
}