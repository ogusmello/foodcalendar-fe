import { formatDate, parseDate } from "@/lib/calendar";
import { mealCategories } from "@/lib/meals";
import type { PlanSummaryProps } from "./types";

const weekdays = [
  { value: "MONDAY", short: "Seg", full: "segunda-feira" },
  { value: "TUESDAY", short: "Ter", full: "terça-feira" },
  { value: "WEDNESDAY", short: "Qua", full: "quarta-feira" },
  { value: "THURSDAY", short: "Qui", full: "quinta-feira" },
  { value: "FRIDAY", short: "Sex", full: "sexta-feira" },
  { value: "SATURDAY", short: "Sáb", full: "sábado" },
  { value: "SUNDAY", short: "Dom", full: "domingo" },
];

export function PlanSummary({ mealName, mealType, people, days, startDate, endDate, repeating, occurrences }: PlanSummaryProps) {
  const category = mealCategories.find(item => item.type === mealType);
  const validPeriod = !!parseDate(startDate) && !!parseDate(endDate) && startDate <= endDate;
  const total = occurrences * people.length;
  const peopleLabel = people.length ? new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" }).format(people) : "Selecione quem participa";
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" };

  return (
    <section aria-label="Resumo do planejamento" className="space-y-4 rounded-card border border-border bg-surface-muted/60 p-4">
      <header>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Resumo do planejamento</p>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] text-muted-foreground">{repeating ? "Recorrente" : "Uma vez"}</span>
        </div>
        <h3 className="mt-2 text-sm font-semibold">{mealName || "Escolha uma refeição"}</h3>
        {category && <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${category.color}`}>{category.label}</span>}
      </header>

      <dl className="grid gap-3 text-xs">
        <div>
          <dt className="text-[11px] text-muted-foreground">Para quem</dt>
          <dd className="mt-1 font-medium">{peopleLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">{startDate === endDate ? "Data" : "Período"}</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
            {validPeriod ? <>
              <span>{formatDate(startDate, dateOptions)}</span>
              {startDate !== endDate && <><span className="text-muted-foreground">até</span><span>{formatDate(endDate, dateOptions)}</span></>}
            </> : "Defina um período válido"}
          </dd>
        </div>
      </dl>

      <div>
        <p className="mb-2 text-[11px] text-muted-foreground">{repeating ? "Repete nos dias" : "Dia da semana"}</p>
        <ul aria-label="Dias da semana do planejamento" className="flex flex-wrap gap-1.5">
          {weekdays.map(day => {
            const selected = days.includes(day.value);
            return <li key={day.value} aria-label={`${day.full}: ${selected ? "incluído" : "não incluído"}`} className={`flex min-w-9 items-center justify-center rounded-control border px-2 py-1.5 text-[11px] ${selected ? "border-primary/20 bg-primary-muted font-semibold text-primary-muted-foreground" : "border-border bg-surface text-muted-foreground"}`}>{day.short}</li>;
          })}
        </ul>
        {validPeriod && (days.length === 0 || occurrences === 0) && <p className="mt-2 text-xs text-warning">{days.length === 0 ? "Selecione ao menos um dia da semana." : "Os dias escolhidos não ocorrem neste período."}</p>}
      </div>

      <footer className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs font-medium">{occurrences} {occurrences === 1 ? "refeição" : "refeições"} por pessoa</p>
        <p className="text-xs text-muted-foreground">{people.length ? <><strong className="font-semibold text-foreground">{total}</strong> {total === 1 ? "refeição no total" : "refeições no total"}</> : "Escolha as pessoas para calcular o total"}</p>
      </footer>
    </section>
  );
}