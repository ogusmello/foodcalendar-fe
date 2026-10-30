import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refeições | Foodist" };

export default function MealsPage() {
  return (
    <section aria-labelledby="meals-heading" className="space-y-6">
      <div>
        <h1 id="meals-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Refeições</h1>
        <p className="mt-2 text-muted-foreground">As opções que fazem parte da rotina de vocês.</p>
      </div>
      <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-semibold">Seu catálogo de refeições</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Esta área receberá a busca, o cadastro e a edição de refeições. A integração com a API será implementada na próxima fase.</p>
      </div>
    </section>
  );
}
