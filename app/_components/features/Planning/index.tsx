import Link from "next/link";
import { getApi } from "@/lib/api/server";
import { localDate, parseDate, formatDate, todayInSaoPaulo } from "@/lib/calendar";
import type { MealPlan, User } from "@/lib/api/types";
import type { PlanningProps } from "./types";

const weekdays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const slots = [
  { type: "BREAKFAST", label: "Café da manhã", color: "bg-meal-breakfast text-meal-breakfast-foreground" },
  { type: "LUNCH", label: "Almoço", color: "bg-meal-lunch text-meal-lunch-foreground" },
  { type: "SNACK", label: "Lanche", color: "bg-meal-snack text-meal-snack-foreground" },
  { type: "DINNER", label: "Jantar", color: "bg-meal-dinner text-meal-dinner-foreground" },
  { type: "DESSERT", label: "Sobremesa", color: "bg-meal-dessert text-meal-dessert-foreground" },
];

export async function Planning({ searchParams }: PlanningProps) {
  const params = await searchParams;
  let users: User[];
  try { users = await getApi<User[]>("/users"); }
  catch { return <p role="status" className="rounded-card bg-surface p-6 text-muted-foreground">Planejamento indisponível no momento.</p>; }
  const today = todayInSaoPaulo();
  const selectedDate = typeof params.date === "string" && parseDate(params.date) ? params.date : today;
  const anchor = parseDate(selectedDate)!;
  const monday = new Date(anchor);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + index);
    return localDate(day);
  });
  const person = typeof params.userId === "string" ? params.userId : null;
  const targets = users.filter((user) => !person || String(user.id) === person);
  const results = await Promise.allSettled(targets.map((user) => getApi<MealPlan[]>(`/meal-plans?userId=${user.id}&startDate=${dates[0]}&endDate=${dates[6]}`)));
  const plans = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const partial = results.some((result) => result.status === "rejected");

  function href(date: string, userId = person) {
    const query = new URLSearchParams({ date });
    if (userId) query.set("userId", userId);
    return `/?${query}`;
  }
  const previous = new Date(monday); previous.setDate(previous.getDate() - 7);
  const next = new Date(monday); next.setDate(next.getDate() + 7);

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Pessoa do planejamento" className="flex flex-wrap gap-2">
        {[{ id: "", name: "Ambos" }, ...users.map(user => ({ id: String(user.id), name: user.name }))].map(user => <Link key={user.id} href={href(selectedDate, user.id || null)} aria-current={(person ?? "") === user.id ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm ${(person ?? "") === user.id ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`}>{user.name}</Link>)}
      </nav>
      <nav aria-label="Semana" className="flex items-center gap-3 text-sm">
        <Link href={href(localDate(previous))} aria-label="Semana anterior" className="rounded-control border border-border bg-surface px-3 py-2">←</Link>
        <Link href={href(today)} className="rounded-control px-2 py-2 font-medium text-primary">Hoje</Link>
        <Link href={href(localDate(next))} aria-label="Próxima semana" className="rounded-control border border-border bg-surface px-3 py-2">→</Link>
      </nav>
    </div>
    <p className="text-sm text-muted-foreground">{formatDate(dates[0])} – {formatDate(dates[6], { day: "numeric", month: "long", year: "numeric" })}</p>
    {partial && <p role="status" className="text-sm text-warning">Parte do planejamento está indisponível.</p>}
    {targets.length === 0 && <p className="text-muted-foreground">Nenhuma pessoa encontrada.</p>}
    <div className="grid gap-bento sm:grid-cols-2 xl:grid-cols-3">
      {dates.map((date) => {
        const weekday = weekdays[parseDate(date)!.getDay()];
        const daily = plans.filter(plan => plan.startDate <= date && plan.endDate >= date && plan.targetDays.includes(weekday));
        return <section key={date} className={`rounded-card border bg-surface p-4 shadow-card ${date === selectedDate ? "border-primary" : "border-border"}`}>
          <Link href={href(date)} className="mb-4 flex items-center justify-between rounded-control">
            <h2 className="text-sm font-semibold capitalize">{formatDate(date, { weekday: "long" })}</h2>
            <span className="text-xs text-muted-foreground">{formatDate(date, { day: "2-digit", month: "short" })}{date === today ? " · Hoje" : ""}</span>
          </Link>
          <div className="space-y-3">
            {slots.filter(slot => !params.mealType || !slots.some(s => s.type === params.mealType) || slot.type === params.mealType).map(slot => {
              const meals = daily.filter(plan => plan.mealType === slot.type);
              return <div key={slot.type}>
                <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{slot.label}</h3>
                {meals.length ? <div className="space-y-1">{meals.map(plan => <Link key={plan.id} href={`/refeicoes?mealId=${plan.meal.id}`} className={`block rounded-control px-3 py-2 ${slot.color} ${String(plan.id) === params.planId ? "ring-2 ring-ring" : ""}`}><span className="block text-xs font-medium">{plan.meal.name}</span><span className="text-[10px]">{plan.user.name}</span></Link>)}</div> : <p className="text-xs text-muted-foreground">{partial ? "Dados incompletos" : "Sem refeição planejada"}</p>}
              </div>;
            })}
          </div>
        </section>;
      })}
    </div>
  </div>;
}