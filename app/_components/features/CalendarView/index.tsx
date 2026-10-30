import { WorkflowTrigger } from "../../common/Workflow";
import { MealTrigger } from "../../common/MealTrigger";
import Link from "next/link";
import { getApi } from "@/lib/api/server";
import type { MealPlan, User } from "@/lib/api/types";
import { formatDate, getMonthDays, getWeekDays, parseDate, shiftDays, shiftMonth, todayInSaoPaulo } from "@/lib/calendar";
import { mealCategories } from "@/lib/meals";
import { DayCell } from "./parts/DayCell";
import { Schedule } from "./parts/Schedule";
import type { CalendarViewProps } from "./types";

const weekdays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const headings = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export async function CalendarView({ searchParams }: CalendarViewProps) {
  const params = await searchParams;
  let users: User[];
  try { users = await getApi<User[]>("/users"); }
  catch { return <p role="status" className="rounded-card bg-surface p-6 text-muted-foreground">Calendário indisponível no momento.</p>; }
  const today = todayInSaoPaulo();
  const date = typeof params.date === "string" && parseDate(params.date) ? params.date : today;
  const person = typeof params.userId === "string" ? params.userId : null;
  const view = params.view === "day" || params.view === "week" ? params.view : "month";
  const days = view === "day" ? [date] : view === "week" ? getWeekDays(date) : getMonthDays(date);
  const targets = users.filter(user => !person || String(user.id) === person);
  const responses = await Promise.allSettled(targets.map(user => getApi<MealPlan[]>(`/meal-plans?userId=${user.id}&startDate=${days[0]}&endDate=${days.at(-1)}`)));
  const plans = responses.flatMap(result => result.status === "fulfilled" ? result.value : []);
  const incomplete = responses.some(result => result.status === "rejected");
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  function href(day: string, userId = person, nextView: string = view) {
    const query = new URLSearchParams({ date: day, view: nextView });
    if (userId) query.set("userId", userId);
    return `/?${query}`;
  }
  function occurrences(day: string) {
    const weekday = weekdays[parseDate(day)!.getDay()];
    return plans.filter(plan => plan.startDate <= day && plan.endDate >= day && plan.targetDays.includes(weekday))
      .sort((a, b) => mealCategories.findIndex(item => item.type === a.mealType) - mealCategories.findIndex(item => item.type === b.mealType) || a.user.id - b.user.id);
  }
  const selectedPlans = occurrences(date);
  const previous = view === "month" ? shiftMonth(date, -1) : shiftDays(date, view === "week" ? -7 : -1);
  const next = view === "month" ? shiftMonth(date, 1) : shiftDays(date, view === "week" ? 7 : 1);
  const title = view === "month" ? formatDate(date, { month: "long", year: "numeric" }) : view === "week" ? `${formatDate(days[0])} – ${formatDate(days[6], { day: "numeric", month: "long", year: "numeric" })}` : formatDate(date, { weekday: "long", day: "numeric", month: "long" });

  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2"><WorkflowTrigger request={{ kind: "plan", date, userId: person ?? undefined }}>Adicionar ao calendário</WorkflowTrigger><WorkflowTrigger request={{ kind: "clone", date, userId: person ?? undefined }} className="rounded-control border border-border bg-surface px-4 py-2 text-sm">Copiar período</WorkflowTrigger>{users.length === 0 && <WorkflowTrigger request={{ kind: "user" }}>Adicionar pessoa</WorkflowTrigger>}</div>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Pessoa no calendário" className="flex flex-wrap gap-2">
        {[{ id: "", name: "Ambos" }, ...users.map(user => ({ id: String(user.id), name: user.name }))].map(user => <Link key={user.id} href={href(date, user.id || null)} aria-current={(person ?? "") === user.id ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm ${(person ?? "") === user.id ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`}>{user.name}</Link>)}
      </nav>
      <nav aria-label="Visão do calendário" className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
        {[{ value: "day", label: "Hoje" }, { value: "week", label: "Semana" }, { value: "month", label: "Mês" }].map(option => <Link key={option.value} href={href(option.value === "day" ? today : date, person, option.value)} aria-current={view === option.value ? "page" : undefined} className={`rounded-full px-4 py-1.5 text-sm ${view === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-muted"}`}>{option.label}</Link>)}
      </nav>
      <nav aria-label="Período do calendário" className="flex items-center gap-2">
        <Link href={href(previous)} aria-label={view === "month" ? "Mês anterior" : view === "week" ? "Semana anterior" : "Dia anterior"} className="rounded-control border border-border bg-surface px-3 py-2">←</Link>
        <Link href={href(today)} className="rounded-control px-3 py-2 text-sm font-medium text-primary">Hoje</Link>
        <Link href={href(next)} aria-label={view === "month" ? "Próximo mês" : view === "week" ? "Próxima semana" : "Próximo dia"} className="rounded-control border border-border bg-surface px-3 py-2">→</Link>
      </nav>
    </div>
    {incomplete && <p role="status" className="text-sm text-warning">Parte dos dados está indisponível. Os dias podem estar incompletos.</p>}
    {targets.length === 0 && <p role="status" className="text-sm text-muted-foreground">Nenhuma pessoa encontrada para este filtro.</p>}
    <div className={`grid items-start gap-bento ${view === "month" ? "2xl:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
      <section aria-labelledby="month-heading" className="min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <h2 id="month-heading" className="text-lg font-semibold capitalize">{title}</h2>
          <span className="text-xs text-muted-foreground">{view === "day" ? `${selectedPlans.length} refeições` : "Selecione um dia para ver as refeições"}</span>
        </div>
        {view === "month" ? <div role="region" aria-label="Calendário mensal, rolável em telas pequenas" tabIndex={0} className="overflow-x-auto">
          <table className="w-full min-w-[42rem] table-fixed border-separate border-spacing-0">
            <caption className="sr-only">{formatDate(date, { month: "long", year: "numeric" })}, refeições planejadas por dia</caption>
            <thead><tr>{headings.map(day => <th key={day} scope="col" className="border-r border-b border-border bg-background px-2 py-3 text-left text-xs font-medium text-muted-foreground last:border-r-0">{day}</th>)}</tr></thead>
            <tbody>{weeks.map(week => <tr key={week[0]}>{week.map(day => <DayCell userId={person} key={day} date={day} today={today} selected={day === date} inMonth={day.slice(0, 7) === date.slice(0, 7)} plans={occurrences(day)} href={href(day)} incomplete={incomplete} />)}</tr>)}</tbody>
          </table>
        </div>
        : <Schedule userId={person} days={days} events={Object.fromEntries(days.map(day => [day, occurrences(day)]))} links={Object.fromEntries(days.map(day => [day, href(day)]))} today={today} selectedDate={date} incomplete={incomplete} />}
        <ul aria-label="Legenda dos tipos de refeição" className="flex flex-wrap gap-2 p-4">{mealCategories.map(item => <li key={item.type} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.color}`}>{item.label}</li>)}</ul>
      </section>
      {view === "month" && <aside aria-labelledby="selected-day-heading" className="rounded-card border border-border bg-surface p-5 shadow-card">
        <p className="text-xs capitalize text-muted-foreground">{formatDate(date, { weekday: "long" })}</p>
        <h2 id="selected-day-heading" className="mt-1 text-lg font-semibold">{formatDate(date, { day: "numeric", month: "long" })}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{selectedPlans.length} refeições{incomplete ? " · dados parciais" : ""}</p>
        <div className="mt-5 space-y-5">{mealCategories.map(item => {
          const meals = selectedPlans.filter(plan => plan.mealType === item.type);
          return <section key={item.type}><h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</h3>{meals.length ? <ul className="space-y-2">{meals.map(plan => <li key={plan.id}><MealTrigger meal={plan.meal} context={{ mealType: plan.mealType, userName: plan.user.name, date, plan }} className={`block w-full rounded-control px-3 py-2.5 text-left ${item.color}`}><span className="block text-xs font-medium">{plan.meal.name}</span><span className="text-[10px]">{plan.user.name}</span></MealTrigger></li>)}</ul> : <p className="text-xs text-muted-foreground">{incomplete ? "Dados incompletos" : "Sem refeição planejada"}</p>}</section>;
        })}</div>
        <Link href={`/?view=week&date=${date}${person ? `&userId=${encodeURIComponent(person)}` : ""}`} className="mt-6 inline-block rounded-control text-sm font-medium text-primary">Ver semana →</Link>
      </aside>}
    </div>
  </div>;
}