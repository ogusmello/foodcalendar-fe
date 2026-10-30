import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarView } from "./_components/features/CalendarView";
import type { CalendarViewProps } from "./_components/features/CalendarView/types";

export const metadata: Metadata = { title: "Calendário | Foodist" };

export default function Home({ searchParams }: CalendarViewProps) {
  return <section aria-labelledby="calendar-heading" className="space-y-6">
    <div><p className="mb-2 text-sm font-medium text-primary">A rotina de vocês</p><h1 id="calendar-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Calendário</h1><p className="mt-2 text-muted-foreground">Organize as refeições dos dois nas visões de hoje, semana e mês.</p></div>
    <Suspense fallback={<p role="status" className="text-muted-foreground">Carregando calendário…</p>}><CalendarView searchParams={searchParams} /></Suspense>
  </section>;
}