import { WorkflowTrigger } from "../../../../common/Workflow";
import { MealTypeIcon } from "../../../../common/MealTypeIcon";
import { MealCard } from "../MealCard";
import Link from "next/link";
import { formatDate } from "@/lib/calendar";
import { mealCategories } from "@/lib/meals";
import type { ScheduleProps } from "./types";

export function Schedule({ types, days, events, links, today, userId, selectedDate, incomplete }: ScheduleProps) {
  const categories = mealCategories.filter(category => !types.length || types.includes(category.type));
  if (days.length === 1) {
    const meals = events[days[0]] ?? [];
    return <div aria-label="Calendário diário" className="grid gap-bento p-4 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map(category => {
        const plans = meals.filter(plan => plan.mealType === category.type);
        return <section key={category.type} className="rounded-card border border-border bg-surface-muted p-4 text-foreground">
          <h3 className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold uppercase leading-5 tracking-wide ${category.color}`}><MealTypeIcon type={category.type} size={14} />{category.label}</h3>
          {plans.length ? <ul className="space-y-1.5">{plans.map(plan => <li key={plan.id}><MealCard plan={plan} date={days[0]} variant="detailed" /></li>)}</ul> : <div className="space-y-2"><p className="text-sm">{incomplete ? "Dados incompletos" : "Sem refeição planejada"}</p><WorkflowTrigger request={{ kind: "plan", date: days[0], mealType: category.type, userId: userId ?? undefined }} className="rounded text-sm underline">+ Adicionar</WorkflowTrigger></div>}
        </section>;
      })}
    </div>;
  }

  return <div role="region" aria-label="Calendário semanal, rolável em telas pequenas" tabIndex={0} className="overflow-x-auto">
    <table className="w-full min-w-[62rem] table-fixed border-separate border-spacing-0">
      <caption className="sr-only">Semana organizada por dia e tipo de refeição</caption>
      <colgroup><col className="w-28" />{days.map(day => <col key={day} />)}</colgroup>
      <thead><tr>
        <th scope="col" className="sticky left-0 z-10 border-r border-b border-border bg-surface px-3 py-3 text-left text-sm font-medium text-muted-foreground">Refeição</th>
        {days.map(day => <th key={day} scope="col" className={`border-r border-b border-border p-2 text-left last:border-r-0 ${day === selectedDate ? "bg-primary-muted/40" : "bg-background"}`}><Link href={links[day]} aria-current={day === selectedDate ? "date" : undefined} className="block rounded-control"><span className="block text-sm font-medium capitalize text-muted-foreground">{formatDate(day, { weekday: "short" })}</span><span className={`mt-1 flex size-7 items-center justify-center rounded-full text-sm ${day === today ? "bg-primary text-primary-foreground" : "text-foreground"}`}>{Number(day.slice(-2))}</span></Link></th>)}
      </tr></thead>
      <tbody>{categories.map(category => <tr key={category.type}>
        <th scope="row" className="sticky left-0 z-10 border-r border-b border-border bg-surface px-2.5 py-3 text-left text-sm font-medium text-muted-foreground"><span className="flex items-center gap-1.5 leading-5"><MealTypeIcon type={category.type} size={14} />{category.label}</span></th>
        {days.map(day => {
          const plans = events[day]?.filter(plan => plan.mealType === category.type) ?? [];
          return <td key={day} className={`border-r border-b border-border p-1.5 align-top last:border-r-0 ${day === selectedDate ? "bg-primary-muted/15" : ""}`}>{plans.length ? <ul className="space-y-1.5">{plans.map(plan => <li key={plan.id}><MealCard plan={plan} date={day} /></li>)}</ul> : <WorkflowTrigger request={{ kind: "plan", date: day, mealType: category.type, userId: userId ?? undefined }} className="rounded text-sm text-primary">+ Adicionar</WorkflowTrigger>}</td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}