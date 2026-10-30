import { Suspense } from "react";
import { Navigation } from "./parts/Navigation";

export function TopNavBar() {
  return (
    <Suspense fallback={<header aria-label="Carregando navegação" className="min-h-topbar border-b border-border bg-surface" />}>
      <Navigation />
    </Suspense>
  );
}