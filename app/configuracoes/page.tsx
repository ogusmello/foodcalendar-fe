import type { Metadata } from "next";
import { ThemeSwitcher } from "../_components/common/ThemeSwitcher";

export const metadata: Metadata = { title: "Configurações | Foodist" };

export default function SettingsPage() {
  return (
    <section aria-labelledby="settings-heading" className="space-y-6">
      <div>
        <h1 id="settings-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Configurações</h1>
        <p className="mt-2 text-muted-foreground">Deixe o Foodist do jeito de vocês.</p>
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
        <p className="mt-2 text-sm text-muted-foreground">A gestão dos nomes de vocês será conectada à API em uma próxima fase.</p>
      </div>
    </section>
  );
}
