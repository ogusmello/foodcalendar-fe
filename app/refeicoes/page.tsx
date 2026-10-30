import { Suspense } from "react";
import type { Metadata } from "next";
import { MealResults } from "../_components/features/MealResults";
import type { MealResultsProps } from "../_components/features/MealResults/types";

export const metadata: Metadata = { title: "Refeições | Foodist" };

export default function MealsPage({ searchParams }: MealResultsProps) {
  return (
    <section aria-labelledby="meals-heading" className="space-y-6">
      <div>
        <h1 id="meals-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Refeições</h1>
        <p className="mt-2 text-muted-foreground">As opções que fazem parte da rotina de vocês.</p>
      </div>
      <Suspense fallback={<p role="status" className="text-sm text-muted-foreground">Carregando refeições…</p>}>
        <MealResults searchParams={searchParams} />
      </Suspense>
    </section>
  );
}