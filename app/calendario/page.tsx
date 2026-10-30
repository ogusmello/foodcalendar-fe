import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarView } from "../_components/features/CalendarView";
import type { CalendarViewProps } from "../_components/features/CalendarView/types";

export const metadata: Metadata = { title: "Calendário | Foodist" };

export default function CalendarPage({ searchParams }: CalendarViewProps) {
  return <section aria-labelledby="calendar-heading" className="space-y-6">
    <div><p className="mb-2 text-sm font-medium text-primary">O mês de vocês</p><h1 id="calendar-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Calendário</h1><p className="mt-2 text-muted-foreground">Veja as refeições no mês e selecione um dia para explorar.</p></div>
    <Suspense fallback={<p role="status" className="text-muted-foreground">Carregando calendário…</p>}><CalendarView searchParams={searchParams} /></Suspense>
  </section>;
}