import { ThemeSwitcher } from "../ThemeSwitcher";

export function TopNavBar() {
  return (
    <header className="flex min-h-topbar items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
      
      <span className="text-sm text-muted-foreground">Seu planejamento alimentar</span>
      <ThemeSwitcher />
    </header>
  );
}

