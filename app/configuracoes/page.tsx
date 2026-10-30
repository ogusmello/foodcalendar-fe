import type { Metadata } from "next";
import { Suspense } from "react";
import { People } from "../_components/features/People";
import { ThemeSwitcher } from "../_components/common/ThemeSwitcher";

export const metadata: Metadata = { title: "Configurações | Yummy" };

export default function SettingsPage() {
  return (
    <section aria-labelledby="settings-heading" className="space-y-6">
      <div>
        <h1 id="settings-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Configurações</h1>
        <p className="mt-2 text-muted-foreground">Personalize a aparência e as preferências de vocês.</p>
      </div>
      <div className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Aparência</h2>
          <p className="mt-2 text-sm text-muted-foreground">Escolha um tema ou acompanhe a preferência do dispositivo.</p>
        </div>
        <ThemeSwitcher />
      </div>
      <div className="rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold">Pessoas</h2>
        <Suspense fallback={<p role="status" className="mt-3 text-sm text-muted-foreground">Carregando pessoas…</p>}><People /></Suspense>
      </div>
    </section>
  );
}
