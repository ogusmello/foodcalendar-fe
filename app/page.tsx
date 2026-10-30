import Link from "next/link";

export default function Home() {
  return (
    <section aria-labelledby="planning-heading" className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-primary">A rotina de vocês</p>
        <h1 id="planning-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Planejamento</h1>
        <p className="mt-2 text-muted-foreground">Um espaço para organizar as refeições dos dois.</p>
      </div>
      <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-semibold">O calendário vem a seguir</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">A estrutura está pronta para receber o planejamento semanal, com a visão conjunta e os filtros individuais. Os dados ainda não estão conectados à API.</p>
        <Link href="/refeicoes" className="mt-6 inline-flex min-h-11 items-center rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Acessar refeições</Link>
      </div>
    </section>
  );
}
