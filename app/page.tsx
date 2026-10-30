import { Suspense } from "react";
import { Planning } from "./_components/features/Planning";
import type { PlanningProps } from "./_components/features/Planning/types";

export default function Home({ searchParams }: PlanningProps) {
  return <section aria-labelledby="planning-heading" className="space-y-6">
    <div><p className="mb-2 text-sm font-medium text-primary">A rotina de vocês</p><h1 id="planning-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Planejamento</h1><p className="mt-2 text-muted-foreground">As refeições dos dois, em uma semana organizada.</p></div>
    <Suspense fallback={<p role="status" className="text-muted-foreground">Carregando planejamento…</p>}><Planning searchParams={searchParams} /></Suspense>
  </section>;
}