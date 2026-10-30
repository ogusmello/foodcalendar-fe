import { MealFilters } from "./parts/MealFilters";
import { AnimatedSurface } from "../../common/AnimatedSurface";
import { WorkflowTrigger } from "../../common/Workflow";
import { DayMeals } from "./parts/DayMeals";
import Link from "next/link";
import { getApi } from "@/lib/api/server";
import type { MealPlan, User, MealType } from "@/lib/api/types";
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
  const rawTypes = typeof params.mealTypes === "string" ? params.mealTypes.split(",") : typeof params.mealType === "string" ? [params.mealType] : [];
  const filterTypes = [...new Set(rawTypes)].filter((type): type is MealType => mealCategories.some(category => category.type === type));
  const days = view === "day" ? [date] : view === "week" ? getWeekDays(date) : getMonthDays(date);
  const targets = users.filter(user => !person || String(user.id) === person);
  const responses = await Promise.allSettled(targets.map(user => getApi<MealPlan[]>(`/meal-plans?userId=${user.id}&startDate=${days[0]}&endDate=${days.at(-1)}`)));
  const plans = responses.flatMap(result => result.status === "fulfilled" ? result.value : []);
  const incomplete = responses.some(result => result.status === "rejected");
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  function href(day: string, userId = person, nextView: string = view) {
    const query = new URLSearchParams({ date: day, view: nextView });
    if (userId) query.set("userId", userId);
    if (filterTypes.length) query.set("mealTypes", filterTypes.join(","));
    return `/?${query}`;
  }
  function occurrences(day: string) {
    const weekday = weekdays[parseDate(day)!.getDay()];
    return plans.filter(plan => plan.startDate <= day && plan.endDate >= day && plan.targetDays.includes(weekday) && (!filterTypes.length || filterTypes.includes(plan.mealType)))
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
        {[{ value: "day", label: "Dia" }, { value: "week", label: "Semana" }, { value: "month", label: "Mês" }].map(option => <Link key={option.value} href={href(date, person, option.value)} aria-current={view === option.value ? "page" : undefined} className={`rounded-full px-4 py-1.5 text-sm ${view === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-muted"}`}>{option.label}</Link>)}
      </nav>
      <nav aria-label="Período do calendário" className="flex items-center gap-2">
        <Link href={href(previous)} aria-label={view === "month" ? "Mês anterior" : view === "week" ? "Semana anterior" : "Dia anterior"} className="rounded-control border border-border bg-surface px-3 py-2">←</Link>
        <time dateTime={date} className="px-3 py-2 text-sm font-medium tabular-nums text-foreground">{formatDate(date, { day: "2-digit", month: "2-digit", year: "numeric" })}</time>
        <Link href={href(next)} aria-label={view === "month" ? "Próximo mês" : view === "week" ? "Próxima semana" : "Próximo dia"} className="rounded-control border border-border bg-surface px-3 py-2">→</Link>
      </nav>
    </div>
    {incomplete && <p role="status" className="text-sm text-warning">Parte dos dados está indisponível. Os dias podem estar incompletos.</p>}
    {targets.length === 0 && <p role="status" className="text-sm text-muted-foreground">Nenhuma pessoa encontrada para este filtro.</p>}
    <AnimatedSurface identity={`${view}:${date}:${person ?? "both"}`} className={`grid items-start gap-bento ${view === "month" ? "2xl:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
      <section aria-labelledby="month-heading" className="min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <h2 id="month-heading" className="text-lg font-semibold capitalize">{title}</h2>
          <span className="text-sm text-muted-foreground">{view === "day" ? `${selectedPlans.length} refeições` : "Selecione um dia para ver as refeições"}</span>
        </div>
        {view === "month" ? <div role="region" aria-label="Calendário mensal, rolável em telas pequenas" tabIndex={0} className="overflow-x-auto">
          <table className="w-full min-w-[42rem] table-fixed border-separate border-spacing-0">
            <caption className="sr-only">{formatDate(date, { month: "long", year: "numeric" })}, refeições planejadas por dia</caption>
            <thead><tr>{headings.map(day => <th key={day} scope="col" className="border-r border-b border-border bg-background px-2 py-3 text-left text-sm font-medium text-muted-foreground last:border-r-0">{day}</th>)}</tr></thead>
            <tbody>{weeks.map(week => <tr key={week[0]}>{week.map(day => <DayCell userId={person} key={day} date={day} today={today} selected={day === date} inMonth={day.slice(0, 7) === date.slice(0, 7)} plans={occurrences(day)} href={href(day, person, "day")} incomplete={incomplete} />)}</tr>)}</tbody>
          </table>
        </div>
        : <Schedule types={filterTypes} userId={person} days={days} events={Object.fromEntries(days.map(day => [day, occurrences(day)]))} links={Object.fromEntries(days.map(day => [day, href(day, person, "day")]))} today={today} selectedDate={date} incomplete={incomplete} />}
        <MealFilters selected={filterTypes} />
      </section>
      {view === "month" && <aside aria-labelledby="selected-day-heading" className="rounded-card border border-border bg-surface p-5 shadow-card">
        <p className="text-sm capitalize text-muted-foreground">{formatDate(date, { weekday: "long" })}</p>
        <h2 id="selected-day-heading" className="mt-1 text-lg font-semibold">{formatDate(date, { day: "numeric", month: "long" })}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{selectedPlans.length} refeições{incomplete ? " · dados parciais" : ""}</p>
        <DayMeals types={filterTypes} plans={selectedPlans} date={date} incomplete={incomplete} />
        <Link href={href(date, person, "week")} className="mt-6 inline-block rounded-control text-sm font-medium text-primary">Ver semana →</Link>
      </aside>}
    </AnimatedSurface>
  </div>;
}