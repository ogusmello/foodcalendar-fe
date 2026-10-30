import Link from "next/link";
import { formatDate } from "@/lib/calendar";
import { mealCategories } from "@/lib/meals";
import type { ScheduleProps } from "./types";

export function Schedule({ days, events, links, today, selectedDate, incomplete }: ScheduleProps) {
  if (days.length === 1) {
    const meals = events[days[0]] ?? [];
    return <div aria-label="Calendário diário" className="grid gap-bento p-4 sm:grid-cols-2 xl:grid-cols-3">
      {mealCategories.map(category => {
        const plans = meals.filter(plan => plan.mealType === category.type);
        return <section key={category.type} className={`rounded-card p-4 ${category.color}`}>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide">{category.label}</h3>
          {plans.length ? <ul className="space-y-3">{plans.map(plan => <li key={plan.id} className="rounded-control bg-surface/70 p-3">
            <p className="mb-1 text-xs font-medium">{plan.user.name}</p>
            <Link href={`/refeicoes?mealId=${plan.meal.id}`} className="rounded text-sm font-semibold hover:underline">{plan.meal.name}</Link>
            <p className="mt-2 text-xs leading-5 text-foreground">{plan.meal.description}</p>
          </li>)}</ul> : <p className="text-xs">{incomplete ? "Dados incompletos" : "Sem refeição planejada"}</p>}
        </section>;
      })}
    </div>;
  }

  return <div role="region" aria-label="Calendário semanal, rolável em telas pequenas" tabIndex={0} className="overflow-x-auto">
    <table className="w-full min-w-[62rem] table-fixed border-separate border-spacing-0">
      <caption className="sr-only">Semana organizada por dia e tipo de refeição</caption>
      <colgroup><col className="w-28" />{days.map(day => <col key={day} />)}</colgroup>
      <thead><tr>
        <th scope="col" className="sticky left-0 z-10 border-r border-b border-border bg-surface px-3 py-3 text-left text-xs font-medium text-muted-foreground">Refeição</th>
        {days.map(day => <th key={day} scope="col" className={`border-r border-b border-border p-2 text-left last:border-r-0 ${day === selectedDate ? "bg-primary-muted/40" : "bg-background"}`}><Link href={links[day]} aria-current={day === selectedDate ? "date" : undefined} className="block rounded-control"><span className="block text-[10px] font-medium capitalize text-muted-foreground">{formatDate(day, { weekday: "short" })}</span><span className={`mt-1 flex size-7 items-center justify-center rounded-full text-sm ${day === today ? "bg-primary text-primary-foreground" : "text-foreground"}`}>{Number(day.slice(-2))}</span></Link></th>)}
      </tr></thead>
      <tbody>{mealCategories.map(category => <tr key={category.type}>
        <th scope="row" className="sticky left-0 z-10 border-r border-b border-border bg-surface px-3 py-4 text-left text-[10px] font-medium text-muted-foreground">{category.label}</th>
        {days.map(day => {
          const plans = events[day]?.filter(plan => plan.mealType === category.type) ?? [];
          return <td key={day} className={`border-r border-b border-border p-1.5 align-top last:border-r-0 ${day === selectedDate ? "bg-primary-muted/15" : ""}`}>{plans.length ? <ul className="space-y-1.5">{plans.map(plan => <li key={plan.id}><Link href={`/refeicoes?mealId=${plan.meal.id}`} className={`block rounded-control px-2 py-2 ${category.color}`}><span className="block text-[11px] font-medium leading-4">{plan.meal.name}</span><span className="mt-1 block text-[10px]">{plan.user.name}</span></Link></li>)}</ul> : <span className="text-[10px] text-muted-foreground">{incomplete ? "Dados incompletos" : "Sem refeição"}</span>}</td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}